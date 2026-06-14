document.addEventListener('DOMContentLoaded', () => {
    // --- State & Storage Keys ---
    const KEYS = {
        PROFILE: 'emv_profile',
        CONTACTS: 'emv_contacts',
        MEDICAL: 'emv_medical',
        INSURANCE: 'emv_insurance',
        THEME: 'emv_theme'
    };

    let data = {
        profile: JSON.parse(localStorage.getItem(KEYS.PROFILE)) || {},
        contacts: JSON.parse(localStorage.getItem(KEYS.CONTACTS)) || [],
        medical: JSON.parse(localStorage.getItem(KEYS.MEDICAL)) || {},
        insurance: JSON.parse(localStorage.getItem(KEYS.INSURANCE)) || {}
    };

    // --- DOM Elements ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.view-section');
    const themeToggle = document.getElementById('themeToggle');
    const toast = document.getElementById('toast');

    // Forms
    const profileForm = document.getElementById('profileForm');
    const medicalForm = document.getElementById('medicalForm');
    const insuranceForm = document.getElementById('insuranceForm');
    
    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    const contactForm = document.getElementById('contactForm');
    const addContactBtn = document.getElementById('addContactBtn');

    // --- Initialization ---
    initTheme();
    loadFormValues();
    updateDashboard();
    renderContactsGrid();

    // --- Theme Management ---
    function initTheme() {
        const savedTheme = localStorage.getItem(KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(KEYS.THEME, newTheme);
    });

    // --- Navigation ---
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(btn.dataset.target + 'View').classList.add('active');
        });
    });

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    // --- Profile Management ---
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        data.profile = {
            name: document.getElementById('pName').value,
            dob: document.getElementById('pDob').value,
            blood: document.getElementById('pBlood').value,
            address: document.getElementById('pAddress').value,
            notes: document.getElementById('pNotes').value
        };
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
        updateDashboard();
        showToast('Profile Saved');
    });

    // --- Medical Management ---
    medicalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        data.medical = {
            allergies: document.getElementById('mAllergies').value,
            conditions: document.getElementById('mConditions').value,
            meds: document.getElementById('mMeds').value,
            physician: document.getElementById('mPhysician').value
        };
        localStorage.setItem(KEYS.MEDICAL, JSON.stringify(data.medical));
        updateDashboard();
        showToast('Medical Info Saved');
    });

    // --- Insurance Management ---
    insuranceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        data.insurance = {
            provider: document.getElementById('iProvider').value,
            policy: document.getElementById('iPolicy').value,
            phone: document.getElementById('iPhone').value,
            license: document.getElementById('iLicense').value,
            passport: document.getElementById('iPassport').value
        };
        localStorage.setItem(KEYS.INSURANCE, JSON.stringify(data.insurance));
        showToast('Insurance & Docs Saved');
    });

    // --- Contacts Management ---
    addContactBtn.addEventListener('click', () => {
        contactForm.reset();
        document.getElementById('cId').value = '';
        document.getElementById('modalTitle').textContent = 'Add Contact';
        contactModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => contactModal.classList.add('hidden'));
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cId').value;
        const contact = {
            id: id || Date.now().toString(),
            name: document.getElementById('cName').value,
            rel: document.getElementById('cRel').value,
            phone: document.getElementById('cPhone').value,
            type: document.getElementById('cType').value
        };

        if (id) {
            const idx = data.contacts.findIndex(c => c.id === id);
            if (idx > -1) data.contacts[idx] = contact;
        } else {
            data.contacts.push(contact);
        }

        // Sort: Primary first
        data.contacts.sort((a,b) => (a.type === 'Primary' ? -1 : 1));

        localStorage.setItem(KEYS.CONTACTS, JSON.stringify(data.contacts));
        contactModal.classList.add('hidden');
        renderContactsGrid();
        updateDashboard();
        showToast('Contact Saved');
    });

    window.editContact = (id) => {
        const c = data.contacts.find(c => c.id === id);
        if (!c) return;
        document.getElementById('cId').value = c.id;
        document.getElementById('cName').value = c.name;
        document.getElementById('cRel').value = c.rel;
        document.getElementById('cPhone').value = c.phone;
        document.getElementById('cType').value = c.type;
        document.getElementById('modalTitle').textContent = 'Edit Contact';
        contactModal.classList.remove('hidden');
    };

    window.deleteContact = (id) => {
        if(confirm("Remove this emergency contact?")) {
            data.contacts = data.contacts.filter(c => c.id !== id);
            localStorage.setItem(KEYS.CONTACTS, JSON.stringify(data.contacts));
            renderContactsGrid();
            updateDashboard();
            showToast('Contact Removed');
        }
    };

    // --- UI Updaters ---
    function loadFormValues() {
        // Profile
        if(data.profile.name) {
            document.getElementById('pName').value = data.profile.name || '';
            document.getElementById('pDob').value = data.profile.dob || '';
            document.getElementById('pBlood').value = data.profile.blood || '';
            document.getElementById('pAddress').value = data.profile.address || '';
            document.getElementById('pNotes').value = data.profile.notes || '';
        }
        // Medical
        if(data.medical.allergies !== undefined) {
            document.getElementById('mAllergies').value = data.medical.allergies || '';
            document.getElementById('mConditions').value = data.medical.conditions || '';
            document.getElementById('mMeds').value = data.medical.meds || '';
            document.getElementById('mPhysician').value = data.medical.physician || '';
        }
        // Insurance
        if(data.insurance.provider !== undefined) {
            document.getElementById('iProvider').value = data.insurance.provider || '';
            document.getElementById('iPolicy').value = data.insurance.policy || '';
            document.getElementById('iPhone').value = data.insurance.phone || '';
            document.getElementById('iLicense').value = data.insurance.license || '';
            document.getElementById('iPassport').value = data.insurance.passport || '';
        }
    }

    function updateDashboard() {
        // Profile Summary
        document.getElementById('dashName').textContent = data.profile.name || 'Name not set';
        document.getElementById('dashDob').textContent = data.profile.dob || 'N/A';
        document.getElementById('dashBloodGroup').textContent = data.profile.blood || 'Unknown';
        document.getElementById('dashAddress').textContent = data.profile.address || 'N/A';

        // Medical Alerts
        document.getElementById('dashAllergies').textContent = data.medical.allergies || 'None reported';
        document.getElementById('dashConditions').textContent = data.medical.conditions || 'None reported';
        document.getElementById('dashMeds').textContent = data.medical.meds || 'None reported';

        // Contacts List
        const dashContacts = document.getElementById('dashContactsGrid');
        const primaryContacts = data.contacts.filter(c => c.type === 'Primary').slice(0,4);
        
        if(primaryContacts.length === 0) {
            dashContacts.innerHTML = '<p class="text-muted">No primary contacts found.</p>';
        } else {
            dashContacts.innerHTML = primaryContacts.map(c => `
                <div class="contact-card" style="padding:10px; flex-direction:row; align-items:center; justify-content:space-between">
                    <div>
                        <div class="font-bold">${c.name}</div>
                        <div class="text-muted" style="font-size:0.85rem">${c.rel}</div>
                    </div>
                    <div class="text-primary font-bold"><a href="tel:${c.phone}" style="color:inherit; text-decoration:none">${c.phone}</a></div>
                </div>
            `).join('');
        }
    }

    function renderContactsGrid() {
        const fullGrid = document.getElementById('fullContactsGrid');
        const emptyState = document.getElementById('emptyContacts');

        if(data.contacts.length === 0) {
            fullGrid.innerHTML = '';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            fullGrid.innerHTML = data.contacts.map(c => `
                <div class="contact-card">
                    <div class="contact-header">
                        <div>
                            <h3 class="mb-1">${c.name}</h3>
                            <span class="text-muted">${c.rel}</span>
                        </div>
                        <span class="contact-type ${c.type}">${c.type}</span>
                    </div>
                    <div class="contact-phone"><a href="tel:${c.phone}" style="color:inherit; text-decoration:none">📞 ${c.phone}</a></div>
                    <div class="mt-4 text-right border-top pt-2" style="border-top:1px solid var(--border); padding-top:10px;">
                        <button class="icon-btn" onclick="editContact('${c.id}')" title="Edit">✎</button>
                        <button class="icon-btn text-danger ml-2" onclick="deleteContact('${c.id}')" title="Delete">✕</button>
                    </div>
                </div>
            `).join('');
        }
    }
});
