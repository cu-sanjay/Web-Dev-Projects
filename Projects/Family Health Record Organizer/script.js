document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let members = JSON.parse(localStorage.getItem('fho_members')) || [];
    let emergencyContacts = JSON.parse(localStorage.getItem('fho_emergency')) || [];
    let currentUser = JSON.parse(localStorage.getItem('fho_user')) || null;
    let currentMemberId = null;
    let currentRecordType = null;
    
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const colorBtns = document.querySelectorAll('.color-btn');
    
    // Auth Elements
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');

    // Navigation
    const navItems = {
        'dashboard': document.getElementById('navDashboard'),
        'members': document.getElementById('navMembers'),
        'emergency': document.getElementById('navEmergency')
    };
    
    // Views
    const views = {
        'dashboard': document.getElementById('dashboardView'),
        'members': document.getElementById('membersView'),
        'memberDetail': document.getElementById('memberDetailView'),
        'emergency': document.getElementById('emergencyView')
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const headerActions = document.getElementById('headerActions');
    
    // Modals
    const modals = {
        'member': document.getElementById('memberModal'),
        'record': document.getElementById('recordModal'),
        'emergency': document.getElementById('emergencyModal')
    };

    const memberForm = document.getElementById('memberForm');
    const recordForm = document.getElementById('recordForm');
    const emergencyForm = document.getElementById('emergencyForm');

    // --- Initialization ---
    if (localStorage.getItem('fho_theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    const savedColorTheme = localStorage.getItem('fho_color_theme') || 'ocean';
    document.body.setAttribute('data-color-theme', savedColorTheme);
    colorBtns.forEach(btn => {
        if (btn.dataset.color === savedColorTheme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // --- Utility Functions ---
    const saveData = () => {
        localStorage.setItem('fho_members', JSON.stringify(members));
        localStorage.setItem('fho_emergency', JSON.stringify(emergencyContacts));
    };

    const getInitials = (name) => {
        if(!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const calculateAge = (dob) => {
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    // --- Auth Logic ---
    const checkAuth = () => {
        if (currentUser) {
            authContainer.classList.add('hidden');
            mainApp.classList.remove('hidden');
            userNameDisplay.textContent = currentUser.name;
            userAvatar.textContent = getInitials(currentUser.name);
            renderDashboard(); // load data
        } else {
            authContainer.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }
    };

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        // Mock login
        currentUser = { name: email.split('@')[0], email: email };
        localStorage.setItem('fho_user', JSON.stringify(currentUser));
        checkAuth();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        // Mock signup
        currentUser = { name: name, email: email };
        localStorage.setItem('fho_user', JSON.stringify(currentUser));
        checkAuth();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('fho_user');
        checkAuth();
    });

    // --- Navigation & View Switching ---
    const switchView = (viewName, title, subtitle, showAddMember = false) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(navItems).forEach(n => n?.classList.remove('active'));
        
        if(views[viewName]) views[viewName].classList.remove('hidden');
        if(navItems[viewName]) navItems[viewName].classList.add('active');
        
        pageTitle.textContent = title;
        pageSubtitle.textContent = subtitle;
        headerActions.style.display = showAddMember ? 'block' : 'none';
    };

    navItems.dashboard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('dashboard', 'Family Dashboard', "A centralized view of your family's health.", true);
        renderDashboard();
    });

    navItems.members.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('members', 'Family Directory', "Manage health profiles for your family.", true);
        renderMembersList();
    });

    navItems.emergency.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('emergency', 'Emergency Info', "Quick access to critical healthcare providers.", false);
        renderEmergency();
    });

    document.getElementById('backToMembersBtn').addEventListener('click', () => {
        navItems.members.click();
    });

    // --- Theme & Settings ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('fho_theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('fho_theme', 'dark');
        }
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            document.body.setAttribute('data-color-theme', color);
            localStorage.setItem('fho_color_theme', color);
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- Modal Management ---
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.add('hidden');
        });
    });

    document.getElementById('addMemberBtn').addEventListener('click', () => {
        memberForm.reset();
        modals.member.classList.remove('hidden');
    });

    document.getElementById('addEmergencyBtn').addEventListener('click', () => {
        emergencyForm.reset();
        modals.emergency.classList.remove('hidden');
    });

    window.openRecordModal = (type) => {
        currentRecordType = type;
        const titleEl = document.getElementById('recordModalTitle');
        const fieldsEl = document.getElementById('recordDynamicFields');
        
        fieldsEl.innerHTML = '';
        recordForm.reset();

        if (type === 'history') {
            titleEl.textContent = 'Add Medical History';
            fieldsEl.innerHTML = `
                <div class="form-group"><label>Condition / Surgery</label><input type="text" id="recCondition" required></div>
                <div class="form-group"><label>Date / Year</label><input type="date" id="recDate" required></div>
                <div class="form-group"><label>Notes</label><textarea id="recNotes" rows="2"></textarea></div>
            `;
        } else if (type === 'vaccine') {
            titleEl.textContent = 'Add Vaccination';
            fieldsEl.innerHTML = `
                <div class="form-group"><label>Vaccine Name</label><input type="text" id="recVaccine" required></div>
                <div class="form-group"><label>Date Administered</label><input type="date" id="recDate" required></div>
                <div class="form-group"><label>Next Due (Optional)</label><input type="date" id="recNextDue"></div>
            `;
        } else if (type === 'medication') {
            titleEl.textContent = 'Add Medication';
            fieldsEl.innerHTML = `
                <div class="form-group"><label>Medication Name</label><input type="text" id="recMedName" required></div>
                <div class="form-group"><label>Dosage & Frequency</label><input type="text" id="recDosage" required placeholder="e.g. 500mg, 2x daily"></div>
                <div class="form-group"><label>Purpose</label><input type="text" id="recPurpose"></div>
            `;
        } else if (type === 'appointment') {
            titleEl.textContent = 'Add Appointment';
            fieldsEl.innerHTML = `
                <div class="form-group"><label>Doctor / Clinic</label><input type="text" id="recDoctor" required></div>
                <div class="form-group"><label>Date & Time</label><input type="datetime-local" id="recDate" required></div>
                <div class="form-group"><label>Reason</label><input type="text" id="recReason" required></div>
            `;
        }

        modals.record.classList.remove('hidden');
    };

    // --- Form Submissions ---
    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMember = {
            id: Date.now().toString(),
            name: document.getElementById('memName').value,
            relation: document.getElementById('memRelation').value,
            dob: document.getElementById('memDob').value,
            blood: document.getElementById('memBlood').value,
            allergies: document.getElementById('memAllergies').value || 'None',
            records: { history: [], vaccine: [], medication: [], appointment: [] }
        };
        members.push(newMember);
        saveData();
        modals.member.classList.add('hidden');
        renderDashboard();
        if(!views.members.classList.contains('hidden')) renderMembersList();
    });

    emergencyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = {
            id: Date.now().toString(),
            name: document.getElementById('emName').value,
            role: document.getElementById('emRole').value,
            phone: document.getElementById('emPhone').value,
            notes: document.getElementById('emNotes').value
        };
        emergencyContacts.push(contact);
        saveData();
        modals.emergency.classList.add('hidden');
        renderEmergency();
    });

    recordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const member = members.find(m => m.id === currentMemberId);
        if(!member) return;

        let recordObj = { id: Date.now().toString() };

        if (currentRecordType === 'history') {
            recordObj.title = document.getElementById('recCondition').value;
            recordObj.date = document.getElementById('recDate').value;
            recordObj.notes = document.getElementById('recNotes').value;
        } else if (currentRecordType === 'vaccine') {
            recordObj.title = document.getElementById('recVaccine').value;
            recordObj.date = document.getElementById('recDate').value;
            recordObj.nextDue = document.getElementById('recNextDue').value;
        } else if (currentRecordType === 'medication') {
            recordObj.title = document.getElementById('recMedName').value;
            recordObj.dosage = document.getElementById('recDosage').value;
            recordObj.purpose = document.getElementById('recPurpose').value;
        } else if (currentRecordType === 'appointment') {
            recordObj.title = document.getElementById('recDoctor').value;
            recordObj.date = document.getElementById('recDate').value;
            recordObj.reason = document.getElementById('recReason').value;
        }

        member.records[currentRecordType].push(recordObj);
        saveData();
        modals.record.classList.add('hidden');
        renderMemberDetail(currentMemberId);
    });

    // --- Deletion ---
    window.deleteRecord = (type, recId) => {
        const member = members.find(m => m.id === currentMemberId);
        if(member && confirm("Delete this record?")) {
            member.records[type] = member.records[type].filter(r => r.id !== recId);
            saveData();
            renderMemberDetail(currentMemberId);
        }
    };

    window.deleteContact = (id) => {
        if(confirm("Delete this emergency contact?")) {
            emergencyContacts = emergencyContacts.filter(c => c.id !== id);
            saveData();
            renderEmergency();
        }
    };

    window.deleteMember = (id) => {
        if(confirm("Are you sure you want to delete this family member and all their records?")) {
            members = members.filter(m => m.id !== id);
            saveData();
            navItems.members.click();
        }
    };

    // --- Rendering ---
    const renderDashboard = () => {
        document.getElementById('totalMembersStat').textContent = members.length;
        
        let pendingVax = 0;
        let upcomingAppt = 0;
        let activityList = [];

        members.forEach(m => {
            // Stats
            m.records.vaccine.forEach(v => { if(v.nextDue && new Date(v.nextDue) >= new Date()) pendingVax++; });
            m.records.appointment.forEach(a => { if(new Date(a.date) >= new Date()) upcomingAppt++; });

            // Activity
            Object.values(m.records).flat().forEach(rec => {
                if(rec.date) {
                    activityList.push({ member: m.name, title: rec.title || rec.reason, date: new Date(rec.date) });
                }
            });
        });

        document.getElementById('pendingVaxStat').textContent = pendingVax;
        document.getElementById('upcomingApptsStat').textContent = upcomingAppt;

        // Render Dashboard Profiles
        const dl = document.getElementById('dashboardProfilesList');
        dl.innerHTML = '';
        if(members.length === 0) {
            dl.innerHTML = '<div class="empty-state-sm text-muted">No family members added yet.</div>';
        } else {
            members.slice(0, 4).forEach(m => {
                dl.innerHTML += `
                    <div class="profile-card" onclick="viewMember('${m.id}')">
                        <div class="profile-avatar">${getInitials(m.name)}</div>
                        <div class="profile-info">
                            <h4>${m.name}</h4>
                            <p>${m.relation} • ${calculateAge(m.dob)} yrs</p>
                        </div>
                    </div>
                `;
            });
        }

        // Render Timeline
        const tl = document.getElementById('recentActivityTimeline');
        tl.innerHTML = '';
        activityList.sort((a,b) => b.date - a.date);
        const recent = activityList.slice(0, 5);
        if(recent.length === 0) {
            tl.innerHTML = '<div class="empty-state-sm text-muted">No recent health activity.</div>';
        } else {
            recent.forEach(act => {
                tl.innerHTML += `
                    <div class="record-item" style="border-left-color: var(--warning)">
                        <h5>${act.title}</h5>
                        <p>${act.member} • ${act.date.toLocaleDateString()}</p>
                    </div>
                `;
            });
        }
    };

    const renderMembersList = () => {
        const grid = document.getElementById('membersGrid');
        const msg = document.getElementById('noMembersMsg');
        
        grid.innerHTML = '';
        if(members.length === 0) {
            msg.classList.remove('hidden');
        } else {
            msg.classList.add('hidden');
            members.forEach(m => {
                grid.innerHTML += `
                    <div class="card glass-panel" style="cursor: pointer;" onclick="viewMember('${m.id}')">
                        <div class="member-grid-header">
                            <div class="profile-avatar">${getInitials(m.name)}</div>
                            <div>
                                <h3>${m.name}</h3>
                                <div class="text-muted" style="margin-top:5px; font-weight:500;">${m.relation}</div>
                            </div>
                        </div>
                        <div class="member-grid-stats">
                            <div class="stat-box text-muted">Age <span>${calculateAge(m.dob)}</span></div>
                            <div class="stat-box text-muted">Blood <span>${m.blood}</span></div>
                            <div class="stat-box text-danger" style="grid-column: 1/-1;">Allergies <span>${m.allergies}</span></div>
                        </div>
                    </div>
                `;
            });
        }
    };

    window.viewMember = (id) => {
        currentMemberId = id;
        renderMemberDetail(id);
    };

    const renderMemberDetail = (id) => {
        const member = members.find(m => m.id === id);
        if(!member) return;

        switchView('memberDetail', member.name, 'Manage individual health records.', false);

        // Header
        document.getElementById('memberProfileHeader').innerHTML = `
            <div class="profile-avatar">${getInitials(member.name)}</div>
            <div>
                <h2 style="font-size: 2.2rem; color: var(--primary); font-weight: 800;">${member.name}</h2>
                <div class="member-meta">
                    <span class="meta-tag">${member.relation}</span>
                    <span class="meta-tag">${calculateAge(member.dob)} yrs (${new Date(member.dob).toLocaleDateString()})</span>
                    <span class="meta-tag">🩸 ${member.blood}</span>
                    ${member.allergies !== 'None' ? `<span class="meta-tag danger">⚠️ ${member.allergies}</span>` : ''}
                </div>
            </div>
            <button class="btn btn-danger shadow-hover" style="margin-left: auto;" onclick="deleteMember('${member.id}')">Delete Member</button>
        `;

        // Render Lists
        const renderList = (elId, type, htmlGen) => {
            const list = document.getElementById(elId);
            list.innerHTML = '';
            if (member.records[type].length === 0) {
                list.innerHTML = '<div class="text-muted" style="font-size:0.95rem; padding: 15px; font-style:italic;">No records added.</div>';
            } else {
                member.records[type].forEach(r => {
                    list.innerHTML += htmlGen(r, type);
                });
            }
        };

        const genHTML = (r, type) => {
            let content = `<h5>${r.title}</h5>`;
            if(r.date) content += `<p>Date: <strong style="color:var(--text-main)">${new Date(r.date).toLocaleDateString()}</strong></p>`;
            if(r.nextDue) content += `<p class="text-warning fw-bold">Next Due: ${new Date(r.nextDue).toLocaleDateString()}</p>`;
            if(r.dosage) content += `<p>${r.dosage}</p>`;
            if(r.purpose) content += `<p class="text-muted">For: ${r.purpose}</p>`;
            if(r.notes) content += `<p class="text-muted">Notes: ${r.notes}</p>`;
            
            return `
                <li class="record-item">
                    ${content}
                    <button class="delete-record-btn" onclick="deleteRecord('${type}', '${r.id}')" title="Delete">✕</button>
                </li>
            `;
        };

        renderList('listHistory', 'history', genHTML);
        renderList('listVaccines', 'vaccine', genHTML);
        renderList('listMedications', 'medication', genHTML);
        renderList('listAppointments', 'appointment', genHTML);
    };

    const renderEmergency = () => {
        const grid = document.getElementById('emergencyContactsGrid');
        grid.innerHTML = '';
        if (emergencyContacts.length === 0) {
            grid.innerHTML = '<div class="empty-state text-muted" style="grid-column: 1/-1;"><h2>No Contacts Found</h2><p>Add emergency contacts to ensure quick access.</p></div>';
        } else {
            emergencyContacts.forEach(c => {
                grid.innerHTML += `
                    <div class="card glass-panel" style="border-left: 5px solid var(--danger);">
                        <h3 class="text-danger" style="margin-bottom: 8px; font-size: 1.4rem;">${c.name}</h3>
                        <div class="fw-bold mb-4 text-muted">${c.role}</div>
                        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 15px; color: var(--text-main);">📞 ${c.phone}</div>
                        ${c.notes ? `<div class="text-muted" style="font-size: 0.95rem; line-height:1.5;">${c.notes}</div>` : ''}
                        <button class="btn btn-secondary mt-4 w-full" onclick="deleteContact('${c.id}')">Remove Contact</button>
                    </div>
                `;
            });
        }
    };

    // Boot Up
    checkAuth();
});
