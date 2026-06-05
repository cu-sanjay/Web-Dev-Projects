/**
 * Chronos Engine - Core State and Orchestration Object
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // --- APPLICATION STATE ---
  let currentDate = new Date(); // Tracks currently displayed Month/Year
  let selectedDate = new Date(); // Tracks dynamically focused day matrix node
  
  // Internal Persistent Database Object
  let eventsDatabase = JSON.parse(localStorage.getItem('chronos_events')) || [
    { id: 1, title: 'Project Blueprint Alignment', date: '2026-10-12', time: '09:30', category: 'work' },
    { id: 2, title: 'Bi-annual Medical Inspection', date: '2026-10-12', time: '14:00', category: 'personal' },
    { id: 3, title: 'Database Outage Patching', date: '2026-10-15', time: '23:15', category: 'urgent' },
    { id: 4, title: 'Client Infrastructure Handoff', date: '2026-10-28', time: '11:00', category: 'work' }
  ];

  // --- CACHED DOM NODES ---
  const monthYearHeader = document.getElementById('current-month-year');
  const calendarGrid = document.getElementById('calendar-grid');
  const agendaDateDisplay = document.getElementById('agenda-date-display');
  const agendaTimeline = document.getElementById('agenda-timeline');
  const alertsTicker = document.getElementById('alerts-ticker');
  const eventForm = document.getElementById('event-form');
  
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnToday = document.getElementById('btn-today');

  // Set default modern date input restriction parameters
  document.getElementById('event-date').value = formatDateISO(selectedDate);

  /**
   * Application Initialization Core Execution Routine
   */
  function init() {
    setupEventListeners();
    renderAll();
  }

  /**
   * Event Listener Setup Mapping
   */
  function setupEventListeners() {
    btnPrev.addEventListener('click', () => adjustMonth(-1));
    btnNext.addEventListener('click', () => adjustMonth(1));
    btnToday.addEventListener('click', jumpToCurrentActualDate);
    eventForm.addEventListener('submit', handleFormSubmission);
  }

  /**
   * Centralized View Synchronizer Controller 
   */
  function renderAll() {
    renderCalendarGrid();
    renderAgendaTimeline();
    renderHighPriorityAlerts();
  }

  /**
   * Algorithmic Calendar Grid Matrix Generator
   */
  function renderCalendarGrid() {
    calendarGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Localized string translation mapping
    const monthsArray = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    monthYearHeader.textContent = `${monthsArray[month]} ${year}`;

    // Structural Offsets Calculation Block
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const renderBuffer = [];

    // 1. Structural Insertion: Pre-month Pad Padding Filler Cells
    for (let i = firstDayIndex; i > 0; i--) {
      const targetDay = totalDaysInPrevMonth - i + 1;
      const targetMonth = month === 0 ? 11 : month - 1;
      const targetYear = month === 0 ? year - 1 : year;
      renderBuffer.push({ day: targetDay, month: targetMonth, year: targetYear, isFiller: true });
    }

    // 2. Structural Insertion: Target Execution Month Generation Cells
    for (let i = 1; i <= totalDaysInMonth; i++) {
      renderBuffer.push({ day: i, month: month, year: year, isFiller: false });
    }

    // 3. Structural Insertion: Post-month Container Symmetry Filler Alignment
    const remainingGridSlots = 42 - renderBuffer.length; // Lock matrix layout tracking precisely to 6 structural rows
    for (let i = 1; i <= remainingGridSlots; i++) {
      const targetMonth = month === 11 ? 0 : month + 1;
      const targetYear = month === 11 ? year + 1 : year;
      renderBuffer.push({ day: i, month: targetMonth, year: targetYear, isFiller: true });
    }

    // 4. Matrix Processing Node Renderer Block
    renderBuffer.forEach(node => {
      const cellDateString = formatDateStrings(node.year, node.month, node.day);
      
      const cellElement = document.createElement('div');
      cellElement.classList.add('day-cell');
      if (node.isFiller) cellElement.classList.add('filler');

      // Check current actual validation against machine standard clock time
      const todayString = formatDateISO(new Date());
      if (cellDateString === todayString) {
        cellElement.classList.add('today');
      }

      // Check current structural node runtime configuration selection target
      if (cellDateString === formatDateISO(selectedDate)) {
        cellElement.classList.add('selected-day');
      }

      // Numerical data context engine
      const numberElement = document.createElement('div');
      numberElement.classList.add('day-number');
      numberElement.textContent = node.day;
      cellElement.appendChild(numberElement);

      // Micro Category-Colored Indicators Extraction Assembly
      const cellEvents = eventsDatabase.filter(e => e.date === cellDateString);
      if (cellEvents.length > 0) {
        const indicatorsWrapper = document.createElement('div');
        indicatorsWrapper.classList.add('cell-indicators');
        
        // Render discrete visual markers limited up to max structural visibility allocation
        cellEvents.slice(0, 4).forEach(evt => {
          const dot = document.createElement('div');
          dot.classList.add('indicator-dot', evt.category);
          indicatorsWrapper.appendChild(dot);
        });
        cellElement.appendChild(indicatorsWrapper);
      }

      // Node Event Management Wireup Matrix
      cellElement.addEventListener('click', () => {
        selectedDate = new Date(node.year, node.month, node.day);
        document.getElementById('event-date').value = formatDateStrings(node.year, node.month, node.day);
        
        // If consumer selects edge filler date, transition focus perspective directly to that node's month grid structure
        if (node.month !== currentDate.getMonth() || node.year !== currentDate.getFullYear()) {
          currentDate = new Date(node.year, node.month, 1);
        }
        
        renderAll();
      });

      calendarGrid.appendChild(cellElement);
    });
  }

  /**
   * Selected Day Agenda Interface Construction Routine
   */
  function renderAgendaTimeline() {
    const formattedIsoTarget = formatDateISO(selectedDate);
    
    // Human readable UI metadata transformation block
    const optimizationOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    agendaDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', optimizationOptions);

    // Context filter sorting array sequentially by hours execution track
    const targetEvents = eventsDatabase
      .filter(e => e.date === formattedIsoTarget)
      .sort((a, b) => a.time.localeCompare(b.time));

    agendaTimeline.innerHTML = '';

    if (targetEvents.length === 0) {
      agendaTimeline.innerHTML = `<div class="empty-agenda">No scheduled items for this date.</div>`;
      return;
    }

    targetEvents.forEach(evt => {
      const agendaItem = document.createElement('div');
      agendaItem.classList.add('agenda-item', evt.category);

      agendaItem.innerHTML = `
        <div class="agenda-time">${evt.time}</div>
        <div class="agenda-details">
          <div class="agenda-title">${escapeHTML(evt.title)}</div>
          <span class="agenda-cat-badge">${evt.category}</span>
        </div>
      `;
      agendaTimeline.appendChild(agendaItem);
    });
  }

  /**
   * System High Priority Urgent Alert Consumer Stream Display
   */
  function renderHighPriorityAlerts() {
    alertsTicker.innerHTML = '';
    
    // Filter out historical artifacts; only display today or incoming future structural notifications
    const absoluteTodayStr = formatDateISO(new Date());
    const urgentItems = eventsDatabase
      .filter(e => e.category === 'urgent' && e.date >= absoluteTodayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    if (urgentItems.length === 0) {
      alertsTicker.innerHTML = `<div class="no-alerts">No urgent priority alerts</div>`;
      return;
    }

    urgentItems.forEach(item => {
      const alertNode = document.createElement('div');
      alertNode.classList.add('alert-item');

      // Transform target standard date formats to clear short-form human representations
      const localizedParts = item.date.split('-');
      const humanizedDateStr = `${localizedParts[1]}/${localizedParts[2]}`;

      alertNode.innerHTML = `
        <div class="alert-title">${escapeHTML(item.title)}</div>
        <div class="alert-time">${humanizedDateStr} @ ${item.time}</div>
      `;
      alertsTicker.appendChild(alertNode);
    });
  }

  /**
   * Form Processing Ingestion Pipeline Core Engine
   */
  function handleFormSubmission(e) {
    e.preventDefault();

    const titleInput = document.getElementById('event-title');
    const dateInput = document.getElementById('event-date');
    const timeInput = document.getElementById('event-time');
    const categoryInput = document.querySelector('input[name="event-category"]:checked');

    const newEvent = {
      id: Date.now(),
      title: titleInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      category: categoryInput.value
    };

    // Inject object into core persistent data frame layer
    eventsDatabase.push(newEvent);
    saveToLocalStorage();

    // Reorient user visualization structure context toward targeted ingestion point
    const parsingTarget = newEvent.date.split('-');
    selectedDate = new Date(parseInt(parsingTarget[0]), parseInt(parsingTarget[1]) - 1, parseInt(parsingTarget[2]));
    currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    // Visual State Mutation Engine Clean Reset Flush
    titleInput.value = '';
    timeInput.value = '';
    document.querySelector('input[name="event-category"][value="work"]').checked = true;

    renderAll();
  }

  /**
   * Navigation Component Offset Modifiers
   */
  function adjustMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderAll();
  }

  function jumpToCurrentActualDate() {
    currentDate = new Date();
    selectedDate = new Date();
    document.getElementById('event-date').value = formatDateISO(selectedDate);
    renderAll();
  }

  
  function formatDateISO(dateObj) {
    return formatDateStrings(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  }

  function formatDateStrings(year, monthIndex, day) {
    const paddedMonth = String(monthIndex + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  }

 
  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  
  function saveToLocalStorage() {
    localStorage.setItem('chronos_events', JSON.stringify(eventsDatabase));
  }

  // Execute system runtime initialization sequences
  init();
});