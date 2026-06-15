const contactForm = document.getElementById('contact-form');
const contactsList = document.getElementById('contacts-list');
const searchInput = document.getElementById('search-contacts');
const interactionContactSelect = document.getElementById('i-contact');

const interactionForm = document.getElementById('interaction-form');
const submitInteractionBtn = document.getElementById('submit-interaction');
const timeline = document.getElementById('activity-timeline');

let contacts = [];
let interactions = [];

// Handle Contact Form Submission
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('c-name').value.trim();
  const company = document.getElementById('c-company').value.trim();
  const role = document.getElementById('c-role').value.trim();
  const email = document.getElementById('c-email').value.trim();
  
  const newContact = {
    id: Date.now(),
    name,
    company,
    role,
    email
  };
  
  contacts.unshift(newContact);
  contactForm.reset();
  updateUI();
});

// Search Contacts
searchInput.addEventListener('input', () => {
  renderContacts(searchInput.value.toLowerCase());
});

// Handle Interaction Form Submission
interactionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const contactId = parseInt(interactionContactSelect.value);
  const type = document.getElementById('i-type').value;
  const requiresFollowUp = document.getElementById('i-followup').checked;
  const notes = document.getElementById('i-notes').value.trim();
  
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  const newInteraction = {
    id: Date.now(),
    contactName: contact.name,
    type,
    notes,
    requiresFollowUp,
    date: new Date().toLocaleString()
  };
  
  interactions.unshift(newInteraction);
  
  // Reset form but keep the contact selected
  document.getElementById('i-type').value = 'Meeting';
  document.getElementById('i-followup').checked = false;
  document.getElementById('i-notes').value = '';
  
  renderTimeline();
});

// Core UI Update function
function updateUI() {
  renderContacts();
  updateContactDropdown();
  
  if (contacts.length > 0) {
    submitInteractionBtn.disabled = false;
  }
}

// Render Contacts
function renderContacts(filterQuery = '') {
  const filtered = contacts.filter(c => {
    return c.name.toLowerCase().includes(filterQuery) || c.company.toLowerCase().includes(filterQuery);
  });
  
  if (filtered.length === 0) {
    if (contacts.length === 0) {
      contactsList.innerHTML = '<div class="empty-state">No contacts added yet. Start building your network!</div>';
    } else {
      contactsList.innerHTML = '<div class="empty-state">No contacts matched your search.</div>';
    }
    return;
  }
  
  contactsList.innerHTML = '';
  
  filtered.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contact-card';
    
    const roleText = c.role ? `${c.role} at ` : '';
    const emailText = c.email ? `<a href="mailto:${c.email}">${c.email}</a>` : 'No email provided';
    
    div.innerHTML = `
      <div class="c-info">
        <h3>${c.name}</h3>
        <div class="c-meta">
          <span>${roleText}<strong>${c.company}</strong></span>
          <span>${emailText}</span>
        </div>
      </div>
    `;
    contactsList.appendChild(div);
  });
}

// Update the select dropdown in the Interaction form
function updateContactDropdown() {
  const currentVal = interactionContactSelect.value;
  
  if (contacts.length === 0) {
    interactionContactSelect.innerHTML = '<option value="" disabled selected>Select a contact first</option>';
    return;
  }
  
  interactionContactSelect.innerHTML = '<option value="" disabled selected>-- Choose Contact --</option>';
  
  contacts.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.company})`;
    interactionContactSelect.appendChild(opt);
  });
  
  // Restore selection if possible
  if (currentVal && contacts.find(c => c.id === parseInt(currentVal))) {
    interactionContactSelect.value = currentVal;
  }
}

// Render Activity Timeline
function renderTimeline() {
  if (interactions.length === 0) {
    timeline.innerHTML = '<div class="empty-state">No interactions logged yet.</div>';
    return;
  }
  
  timeline.innerHTML = '';
  
  interactions.forEach(i => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    
    const followupHtml = i.requiresFollowUp ? '<span class="followup-badge">Follow-up Needed</span>' : '';
    
    div.innerHTML = `
      <div class="t-header">
        <span class="t-contact">${i.contactName}</span>
        <span class="t-type">${i.type}</span>
      </div>
      <div class="t-notes">${i.notes}</div>
      <div class="t-footer">
        <span>${i.date}</span>
        ${followupHtml}
      </div>
    `;
    
    timeline.appendChild(div);
  });
}

// Initialize
updateUI();
renderTimeline();
