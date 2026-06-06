// Select DOM Elements
const addJobBtn = document.getElementById('addJobBtn');
const jobModal = document.getElementById('jobModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const jobForm = document.getElementById('jobForm');
const modalTitle = document.getElementById('modalTitle');

const searchInput = document.getElementById('searchInput');
const resetHistory = document.getElementById('resetHistory');

const statTotal = document.getElementById('statTotal');
const statInterviewing = document.getElementById('statInterviewing');
const statOffers = document.getElementById('statOffers');
const statSuccessRate = document.getElementById('statSuccessRate');

const columnsContainers = {
  wishlist: document.getElementById('column-wishlist'),
  applied: document.getElementById('column-applied'),
  interviewing: document.getElementById('column-interviewing'),
  offer: document.getElementById('column-offer'),
  rejected: document.getElementById('column-rejected')
};

const countsLabels = {
  wishlist: document.getElementById('count-wishlist'),
  applied: document.getElementById('count-applied'),
  interviewing: document.getElementById('count-interviewing'),
  offer: document.getElementById('count-offer'),
  rejected: document.getElementById('count-rejected')
};

// State Variables
let jobsList = [];
let searchQuery = '';

// Default Mock Data to populate the board on first load
function loadSampleJobs() {
  const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const getFutureDateTime = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(10, 0, 0, 0); // 10:00 AM
    return d.toISOString().substring(0, 16); // Formatted for datetime-local
  };

  jobsList = [
    {
      id: 'job_1',
      company: 'Google',
      title: 'Frontend Engineer',
      salary: '$120,000 - $140,000',
      status: 'wishlist',
      dateApplied: '',
      interviewDate: '',
      url: 'https://careers.google.com',
      notes: 'Referred by John. Tech stack: React, TS, Tailwind CSS.'
    },
    {
      id: 'job_2',
      company: 'Microsoft',
      title: 'Software Engineer II',
      salary: '$130,000',
      status: 'applied',
      dateApplied: getPastDate(4),
      interviewDate: '',
      url: 'https://careers.microsoft.com',
      notes: 'Applied through LinkedIn. Received automated confirmation email.'
    },
    {
      id: 'job_3',
      company: 'Apple',
      title: 'UI Developer',
      salary: '$145,000',
      status: 'interviewing',
      dateApplied: getPastDate(8),
      interviewDate: getFutureDateTime(2),
      url: 'https://careers.apple.com',
      notes: 'First round technical interview scheduled. Focus on CSS layouts, animations, and JS core.'
    },
    {
      id: 'job_4',
      company: 'Stripe',
      title: 'React Developer',
      salary: '$135,000',
      status: 'offer',
      dateApplied: getPastDate(14),
      interviewDate: '',
      url: 'https://stripe.com/jobs',
      notes: 'Written offer received! Looking to negotiate base salary.'
    }
  ];
  saveToStorage();
}

// LocalStorage helpers
function loadFromStorage() {
  try {
    const cached = localStorage.getItem('forge_jobs_data');
    if (cached) {
      jobsList = JSON.parse(cached);
    } else {
      loadSampleJobs();
    }
  } catch (e) {
    loadSampleJobs();
  }
}

function saveToStorage() {
  localStorage.setItem('forge_jobs_data', JSON.stringify(jobsList));
}

// Dashboard Stats Calculator
function calculateStats() {
  const total = jobsList.length;
  const interviewing = jobsList.filter(j => j.status === 'interviewing').length;
  const offers = jobsList.filter(j => j.status === 'offer').length;
  
  const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  
  statTotal.textContent = total;
  statInterviewing.textContent = interviewing;
  statOffers.textContent = offers;
  statSuccessRate.textContent = `${successRate}%`;
}

// Format Date string
function formatJobDate(dateStr) {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatJobTime(dateTimeStr) {
  if (!dateTimeStr) return 'Not set';
  const d = new Date(dateTimeStr);
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// DOM Kanban cards builder
function renderKanban() {
  // Clear columns
  Object.keys(columnsContainers).forEach(status => {
    columnsContainers[status].innerHTML = '';
  });

  // Filter jobs by search query
  const filteredJobs = jobsList.filter(job => {
    const query = searchQuery.toLowerCase();
    return (
      job.company.toLowerCase().includes(query) ||
      job.title.toLowerCase().includes(query) ||
      job.notes.toLowerCase().includes(query)
    );
  });

  // Tallies count tracker
  const statusCounts = { wishlist: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0 };

  filteredJobs.forEach(job => {
    statusCounts[job.status]++;
    
    const card = document.createElement('article');
    card.className = 'job-card';
    card.draggable = true;
    card.dataset.id = job.id;

    // Build card HTML content
    const dateSection = job.status === 'interviewing' && job.interviewDate
      ? `<div class="card-meta-item"><span>📅</span><span>Int: <strong>${formatJobTime(job.interviewDate)}</strong></span></div>`
      : job.dateApplied
        ? `<div class="card-meta-item"><span>📅</span><span>Applied: <strong>${formatJobDate(job.dateApplied)}</strong></span></div>`
        : '';

    const salarySection = job.salary
      ? `<div class="card-badge">${job.salary}</div>`
      : '';

    card.innerHTML = `
      <div class="card-header-row">
        <div>
          <span class="company-name">${job.company}</span>
          <h3>${job.title}</h3>
        </div>
        <button type="button" class="btn-card-action" title="Delete application" onclick="deleteJob(event, '${job.id}')">🗑️</button>
      </div>
      <div class="card-meta-list">
        ${dateSection}
      </div>
      ${salarySection}
    `;

    // Click card to edit details
    card.addEventListener('click', (e) => {
      // Prevent editing dialog popup if clicking delete button
      if (e.target.classList.contains('btn-card-action')) return;
      openEditModal(job);
    });

    // Native Drag API listeners
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Append card to corresponding status column
    if (columnsContainers[job.status]) {
      columnsContainers[job.status].appendChild(card);
    }
  });

  // Update column numbers labels
  Object.keys(countsLabels).forEach(status => {
    countsLabels[status].textContent = statusCounts[status];
  });

  // Recalculate stats counters
  calculateStats();
}

// Modal Form Controllers
function openAddModal() {
  modalTitle.textContent = 'New Job Application';
  jobForm.reset();
  document.getElementById('jobId').value = '';
  document.getElementById('dateApplied').value = new Date().toISOString().split('T')[0];
  jobModal.classList.remove('hidden');
}

function openEditModal(job) {
  modalTitle.textContent = 'Edit Job Application';
  document.getElementById('jobId').value = job.id;
  document.getElementById('companyName').value = job.company;
  document.getElementById('jobTitle').value = job.title;
  document.getElementById('salaryRange').value = job.salary || '';
  document.getElementById('jobStatus').value = job.status;
  document.getElementById('dateApplied').value = job.dateApplied || '';
  document.getElementById('interviewDate').value = job.interviewDate || '';
  document.getElementById('jobUrl').value = job.url || '';
  document.getElementById('jobNotes').value = job.notes || '';
  jobModal.classList.remove('hidden');
}

function closeModal() {
  jobModal.classList.add('hidden');
}

// Global Card delete function
window.deleteJob = function(e, id) {
  e.stopPropagation();
  if (confirm('Are you sure you want to remove this job application?')) {
    jobsList = jobsList.filter(j => j.id !== id);
    saveToStorage();
    renderKanban();
  }
};

// Setup Drag & Drop listeners on Columns
Object.keys(columnsContainers).forEach(status => {
  const container = columnsContainers[status];
  const columnEl = container.closest('.kanban-column');
  
  columnEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    columnEl.classList.add('drag-over');
  });

  columnEl.addEventListener('dragleave', () => {
    columnEl.classList.remove('drag-over');
  });

  columnEl.addEventListener('drop', (e) => {
    e.preventDefault();
    columnEl.classList.remove('drag-over');
    
    const draggingCard = document.querySelector('.dragging');
    if (draggingCard) {
      const jobId = draggingCard.dataset.id;
      const targetJob = jobsList.find(j => j.id === jobId);
      if (targetJob && targetJob.status !== status) {
        targetJob.status = status;
        saveToStorage();
        renderKanban();
      }
    }
  });
});

// Bind Event Listeners
addJobBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelFormBtn.addEventListener('click', closeModal);

// Handle Click outside modal to close
jobModal.addEventListener('click', (e) => {
  if (e.target === jobModal) {
    closeModal();
  }
});

// Form submission logic (Add/Edit save)
jobForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('jobId').value;
  const company = document.getElementById('companyName').value;
  const title = document.getElementById('jobTitle').value;
  const salary = document.getElementById('salaryRange').value;
  const status = document.getElementById('jobStatus').value;
  const dateApplied = document.getElementById('dateApplied').value;
  const interviewDate = document.getElementById('interviewDate').value;
  const url = document.getElementById('jobUrl').value;
  const notes = document.getElementById('jobNotes').value;

  if (id) {
    // Edit Mode
    const target = jobsList.find(j => j.id === id);
    if (target) {
      target.company = company;
      target.title = title;
      target.salary = salary;
      target.status = status;
      target.dateApplied = dateApplied;
      target.interviewDate = interviewDate;
      target.url = url;
      target.notes = notes;
    }
  } else {
    // Create Mode
    const newJob = {
      id: 'job_' + Date.now(),
      company,
      title,
      salary,
      status,
      dateApplied,
      interviewDate,
      url,
      notes
    };
    jobsList.push(newJob);
  }

  saveToStorage();
  closeModal();
  renderKanban();
});

// Live Search Input Filter
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderKanban();
});

// Reset application data handler
resetHistory.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all job applications data?')) {
    localStorage.removeItem('forge_jobs_data');
    loadSampleJobs();
    renderKanban();
  }
});

// Start Tracker Application
loadFromStorage();
renderKanban();
