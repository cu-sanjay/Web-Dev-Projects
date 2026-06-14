const form = document.getElementById('complaint-form');
const complaintsList = document.getElementById('complaints-list');
const statusFilter = document.getElementById('status-filter');

let complaints = [];

form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const roomNumber = document.getElementById('room-number').value.trim();
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value.trim();
  
  const newComplaint = {
    id: Date.now(),
    roomNumber,
    category,
    description,
    status: 'Pending', // Pending, In Progress, Resolved
    date: new Date().toLocaleString()
  };
  
  complaints.unshift(newComplaint);
  renderComplaints();
  form.reset();
});

window.cycleStatus = function(id) {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) return;
  
  if (complaint.status === 'Pending') {
    complaint.status = 'In Progress';
  } else if (complaint.status === 'In Progress') {
    complaint.status = 'Resolved';
  } else {
    complaint.status = 'Pending';
  }
  
  renderComplaints();
}

function getStatusClass(status) {
  if (status === 'In Progress') return 'status-Progress';
  return `status-${status}`;
}

function renderComplaints() {
  const filterValue = statusFilter.value;
  
  const filtered = complaints.filter(c => {
    if (filterValue === 'All') return true;
    return c.status === filterValue;
  });
  
  if (filtered.length === 0) {
    complaintsList.innerHTML = '<div class="empty-state">No complaints found.</div>';
    return;
  }
  
  complaintsList.innerHTML = '';
  
  filtered.forEach(c => {
    const el = document.createElement('div');
    el.className = 'complaint-item';
    
    // Using a simple cycle text for the button to simulate admin action
    let nextStatusText = 'Mark In Progress';
    if (c.status === 'In Progress') nextStatusText = 'Mark Resolved';
    if (c.status === 'Resolved') nextStatusText = 'Reopen (Pending)';

    el.innerHTML = `
      <div class="complaint-details">
        <div class="c-header">
          <span class="c-room">${c.roomNumber}</span>
          <span class="c-category">${c.category}</span>
        </div>
        <div class="c-desc">${c.description}</div>
        <div class="c-date">Logged on: ${c.date}</div>
      </div>
      <div class="complaint-status">
        <div class="status-badge ${getStatusClass(c.status)}">${c.status}</div>
        <button class="update-status-btn" onclick="cycleStatus(${c.id})">${nextStatusText}</button>
      </div>
    `;
    
    complaintsList.appendChild(el);
  });
}

statusFilter.addEventListener('change', renderComplaints);
