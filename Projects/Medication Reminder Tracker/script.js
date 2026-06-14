document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let medications = JSON.parse(localStorage.getItem('mediMeds')) || [];
    let doseHistory = JSON.parse(localStorage.getItem('mediHistory')) || [];
    
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const colorBtns = document.querySelectorAll('.color-btn');
    
    const navDashboard = document.getElementById('navDashboard');
    const navMedications = document.getElementById('navMedications');
    const navSchedule = document.getElementById('navSchedule');
    
    const dashboardView = document.getElementById('dashboardView');
    const medicationsView = document.getElementById('medicationsView');
    const scheduleView = document.getElementById('scheduleView');
    
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    const addMedBtn = document.getElementById('addMedBtn');
    const medModal = document.getElementById('medModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const medForm = document.getElementById('medForm');
    const medFreq = document.getElementById('medFreq');
    const timeInputsContainer = document.getElementById('timeInputsContainer');

    // --- Initialization ---
    if (localStorage.getItem('mediTheme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    const savedColorTheme = localStorage.getItem('mediColorTheme') || 'teal';
    document.body.setAttribute('data-color-theme', savedColorTheme);
    colorBtns.forEach(btn => {
        if (btn.dataset.color === savedColorTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.getElementById('todayDateDisplay').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    // --- Event Listeners ---
    
    // Themes
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('mediTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('mediTheme', 'dark');
        }
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            document.body.setAttribute('data-color-theme', color);
            localStorage.setItem('mediColorTheme', color);
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Navigation
    const switchView = (viewId, title, subtitle) => {
        [dashboardView, medicationsView, scheduleView].forEach(v => v.classList.add('hidden'));
        [navDashboard, navMedications, navSchedule].forEach(n => n.classList.remove('active'));
        
        document.getElementById(viewId).classList.remove('hidden');
        pageTitle.textContent = title;
        pageSubtitle.textContent = subtitle;
    };

    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('dashboardView', 'Health Dashboard', 'Track your adherence and upcoming doses.');
        navDashboard.classList.add('active');
        renderDashboard();
    });

    navMedications.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('medicationsView', 'My Medications', 'Manage your prescriptions and dosages.');
        navMedications.classList.add('active');
        renderMedications();
    });

    navSchedule.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('scheduleView', 'Daily Schedule', 'Your medication timeline for today.');
        navSchedule.classList.add('active');
        renderSchedule();
    });

    // Modal
    addMedBtn.addEventListener('click', () => {
        medModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        medModal.classList.add('hidden');
    });

    // Dynamic Time Inputs based on Frequency
    medFreq.addEventListener('change', (e) => {
        const count = parseInt(e.target.value) || 1;
        timeInputsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            timeInputsContainer.innerHTML += `
                <div class="form-group">
                    <label>Time for Dose ${i}</label>
                    <input type="time" class="dose-time-input" required>
                </div>
            `;
        }
    });

    // Form Submission
    medForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const timeInputs = document.querySelectorAll('.dose-time-input');
        const times = Array.from(timeInputs).map(input => input.value).sort();

        const newMed = {
            id: Date.now().toString(),
            name: document.getElementById('medName').value,
            dosage: document.getElementById('medDosage').value,
            frequency: parseInt(medFreq.value),
            times: times,
            instructions: document.getElementById('medInstructions').value || 'None',
            createdAt: new Date().toISOString()
        };

        medications.push(newMed);
        localStorage.setItem('mediMeds', JSON.stringify(medications));
        
        medForm.reset();
        timeInputsContainer.innerHTML = `
            <div class="form-group">
                <label>Time for Dose 1</label>
                <input type="time" class="dose-time-input" required>
            </div>
        `;
        medModal.classList.add('hidden');
        
        renderAll();
    });

    // --- Core Logic & Rendering ---

    const getTodayDateString = () => new Date().toISOString().split('T')[0];

    const generateTodaySchedule = () => {
        let schedule = [];
        const todayStr = getTodayDateString();
        
        medications.forEach(med => {
            med.times.forEach(time => {
                // Check if this dose was taken or missed today
                const historyRecord = doseHistory.find(h => h.medId === med.id && h.time === time && h.date === todayStr);
                
                let status = 'pending'; // pending, taken, missed
                if (historyRecord) {
                    status = historyRecord.status;
                } else {
                    // Check if time has passed
                    const now = new Date();
                    const [hours, minutes] = time.split(':');
                    const doseTime = new Date();
                    doseTime.setHours(hours, minutes, 0);
                    
                    // If dose time is past by more than 1 hour, mark implicitly as missed in UI
                    if (now > doseTime && (now - doseTime) > 60 * 60 * 1000) {
                        status = 'missed';
                    }
                }

                schedule.push({
                    medId: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    time: time,
                    status: status,
                    instructions: med.instructions
                });
            });
        });

        // Sort by time
        return schedule.sort((a, b) => a.time.localeCompare(b.time));
    };

    const handleDoseAction = (medId, time, status) => {
        const todayStr = getTodayDateString();
        
        // Remove existing record for today if exists
        doseHistory = doseHistory.filter(h => !(h.medId === medId && h.time === time && h.date === todayStr));
        
        // Add new record
        doseHistory.push({
            id: Date.now().toString(),
            medId,
            time,
            date: todayStr,
            status, // 'taken' or 'missed'
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('mediHistory', JSON.stringify(doseHistory));
        renderAll();
    };

    window.takeDose = (medId, time) => handleDoseAction(medId, time, 'taken');
    window.missDose = (medId, time) => handleDoseAction(medId, time, 'missed');
    window.deleteMed = (medId) => {
        if(confirm("Are you sure you want to delete this medication?")) {
            medications = medications.filter(m => m.id !== medId);
            localStorage.setItem('mediMeds', JSON.stringify(medications));
            renderAll();
        }
    };

    // Rendering Dashboard
    const renderDashboard = () => {
        const todaySchedule = generateTodaySchedule();
        
        let pending = 0;
        let missed = 0;
        let taken = 0;
        let totalToday = todaySchedule.length;

        todaySchedule.forEach(item => {
            if (item.status === 'pending') pending++;
            else if (item.status === 'missed') missed++;
            else if (item.status === 'taken') taken++;
        });

        const adherence = totalToday > 0 ? Math.round((taken / totalToday) * 100) : 100;

        document.getElementById('adherenceRate').textContent = `${adherence}%`;
        document.getElementById('pendingDoses').textContent = pending;
        document.getElementById('missedDoses').textContent = missed;

        document.getElementById('statTotalMeds').textContent = medications.length;
        document.getElementById('statDosesTaken').textContent = doseHistory.filter(h => h.status === 'taken').length;

        // Up Next List (Pending items for today)
        const upNextList = document.getElementById('upNextList');
        const pendingItems = todaySchedule.filter(item => item.status === 'pending');
        
        if (pendingItems.length === 0) {
            upNextList.innerHTML = '<div class="empty-state-sm text-muted">All caught up for today!</div>';
        } else {
            upNextList.innerHTML = '';
            pendingItems.forEach(item => {
                const el = document.createElement('div');
                el.className = 'schedule-item';
                el.innerHTML = `
                    <div class="schedule-info">
                        <span class="med-time">${item.time}</span>
                        <span class="med-name-disp">${item.name}</span>
                        <span class="med-dosage-disp">${item.dosage}</span>
                    </div>
                    <div class="schedule-actions">
                        <button class="btn btn-sm btn-success" onclick="takeDose('${item.medId}', '${item.time}')">Take</button>
                        <button class="btn btn-sm btn-danger" onclick="missDose('${item.medId}', '${item.time}')">Skip</button>
                    </div>
                `;
                upNextList.appendChild(el);
            });
        }
    };

    // Rendering Medications View
    const renderMedications = () => {
        const grid = document.getElementById('medicationGrid');
        const msg = document.getElementById('noMedsMsg');

        if (medications.length === 0) {
            grid.innerHTML = '';
            msg.style.display = 'block';
        } else {
            msg.style.display = 'none';
            grid.innerHTML = '';
            medications.forEach(med => {
                const el = document.createElement('div');
                el.className = 'med-card';
                el.innerHTML = `
                    <h4>${med.name}</h4>
                    <div class="detail"><strong>Dosage:</strong> ${med.dosage}</div>
                    <div class="detail"><strong>Frequency:</strong> ${med.frequency}x/day</div>
                    <div class="detail"><strong>Times:</strong> ${med.times.join(', ')}</div>
                    <div class="detail"><strong>Instr:</strong> ${med.instructions}</div>
                    <div class="med-actions">
                        <button class="btn btn-sm btn-danger" onclick="deleteMed('${med.id}')">Remove</button>
                    </div>
                `;
                grid.appendChild(el);
            });
        }
    };

    // Rendering Schedule View
    const renderSchedule = () => {
        const list = document.getElementById('dailyScheduleList');
        const msg = document.getElementById('noScheduleMsg');
        const todaySchedule = generateTodaySchedule();

        if (todaySchedule.length === 0) {
            list.innerHTML = '';
            msg.style.display = 'block';
        } else {
            msg.style.display = 'none';
            list.innerHTML = '';
            todaySchedule.forEach(item => {
                const el = document.createElement('div');
                el.className = `schedule-item ${item.status}`;
                
                let actionHTML = '';
                if (item.status === 'pending') {
                    actionHTML = `
                        <button class="btn btn-sm btn-success" onclick="takeDose('${item.medId}', '${item.time}')">Take</button>
                        <button class="btn btn-sm btn-danger" onclick="missDose('${item.medId}', '${item.time}')">Skip</button>
                    `;
                } else if (item.status === 'taken') {
                    actionHTML = `<span class="text-success fw-bold">Taken ✅</span>`;
                } else if (item.status === 'missed') {
                    actionHTML = `<span class="text-danger fw-bold">Missed ❌</span>`;
                }

                el.innerHTML = `
                    <div class="schedule-info">
                        <span class="med-time">${item.time}</span>
                        <span class="med-name-disp">${item.name}</span>
                        <span class="med-dosage-disp">${item.dosage}</span>
                        ${item.instructions !== 'None' ? `<span class="med-dosage-disp" style="font-style: italic;">Note: ${item.instructions}</span>` : ''}
                    </div>
                    <div class="schedule-actions">
                        ${actionHTML}
                    </div>
                `;
                list.appendChild(el);
            });
        }
    };

    const renderAll = () => {
        renderDashboard();
        renderMedications();
        renderSchedule();
    };

    // Initial render
    renderAll();
});
