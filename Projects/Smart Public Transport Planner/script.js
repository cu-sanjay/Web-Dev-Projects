const routeForm = document.getElementById('route-form');
const originSelect = document.getElementById('origin');
const destSelect = document.getElementById('destination');
const resultsList = document.getElementById('results-list');

// Simple mock data graph representing station connections and base travel times (in minutes)
const stations = [
  "Central Station", "North Park", "East Side Mall", 
  "University Campus", "Airport Terminal", "Downtown Hub"
];

// Helper to calculate a deterministic pseudo-random duration based on origin and destination
function getBaseDuration(origin, dest) {
  const oIdx = stations.indexOf(origin);
  const dIdx = stations.indexOf(dest);
  return (Math.abs(oIdx - dIdx) + 1) * 12; // Base 12 mins per "stop" distance
}

routeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const origin = originSelect.value;
  const dest = destSelect.value;
  const time = document.getElementById('departure-time').value;
  
  if (origin === dest) {
    resultsList.innerHTML = '<div class="empty-state">Origin and destination cannot be the same.</div>';
    return;
  }
  
  generateRoutes(origin, dest, time);
});

function generateRoutes(origin, dest, time) {
  const baseMins = getBaseDuration(origin, dest);
  const distanceFactor = baseMins / 12; // number of 'stops'
  
  // Create 3 simulated transit options
  const routes = [
    {
      mode: 'Subway',
      icon: '🚇',
      class: 'mode-subway',
      duration: Math.round(baseMins * 0.8), // fastest
      cost: (2.50 + (distanceFactor * 0.50)).toFixed(2),
      details: 'Direct underground route. Avoids traffic.'
    },
    {
      mode: 'Train',
      icon: '🚆',
      class: 'mode-train',
      duration: Math.round(baseMins * 1.1),
      cost: (3.00 + (distanceFactor * 0.75)).toFixed(2),
      details: 'Express surface train. Very comfortable.'
    },
    {
      mode: 'Bus',
      icon: '🚌',
      class: 'mode-bus',
      duration: Math.round(baseMins * 1.5), // slowest due to traffic
      cost: (1.50 + (distanceFactor * 0.25)).toFixed(2),
      details: 'Local bus service. May experience traffic delays.'
    }
  ];
  
  renderRoutes(routes, origin, dest, time);
}

function formatArrivalTime(depTime, durationMins) {
  if (!depTime) return '';
  const [hours, mins] = depTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(mins + durationMins);
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderRoutes(routes, origin, dest, time) {
  resultsList.innerHTML = '';
  
  // Sort by duration ascending
  routes.sort((a, b) => a.duration - b.duration);
  
  routes.forEach(r => {
    const arrivalTime = formatArrivalTime(time, r.duration);
    const timeString = arrivalTime ? `Arrives around ${arrivalTime}` : '';
    
    const div = document.createElement('div');
    div.className = 'route-card';
    div.innerHTML = `
      <div class="r-info">
        <div class="r-mode">
          ${r.icon} <span class="mode-badge ${r.class}">${r.mode}</span>
        </div>
        <div class="r-details">
          ${r.details}<br>
          <small>${timeString}</small>
        </div>
      </div>
      <div class="r-stats">
        <span class="r-duration">${r.duration} min</span>
        <span class="r-cost">$${r.cost}</span>
      </div>
    `;
    resultsList.appendChild(div);
  });
}
