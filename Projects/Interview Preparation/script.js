const STORAGE_KEYS = {
  notes: "notes",
  bookmarkedQuestions: "bookmarkedQuestions",
  completedQuestions: "completedQuestions",
  resources: "resources",
  progress: "progress",
  theme: "theme",
  dailyQuestion: "dailyQuestion",
  mockInterviewHistory: "mockInterviewHistory",
  streakData: "streakData"
};

const DEFAULT_PROGRESS = {
  HR: 0,
  Java: 0,
  JavaScript: 0,
  React: 0,
  "Node.js": 0,
  DBMS: 0,
  OS: 0
};

const HR_QUESTIONS = [
  {
    text: "Tell me about yourself.",
    answer: "Give a short professional summary covering your background, core strengths, and current career goals in under 90 seconds."
  },
  {
    text: "What are your strengths?",
    answer: "Share 2-3 strengths with examples, such as problem solving, communication, or ownership, and connect each to the role."
  },
  {
    text: "What are your weaknesses?",
    answer: "Mention a real but manageable weakness, then explain what steps you are taking to improve it with a recent example."
  },
  {
    text: "Why should we hire you?",
    answer: "Match your relevant skills, projects, and attitude with the job requirements and show how you can deliver impact quickly."
  },
  {
    text: "Describe a challenge you faced and how you solved it.",
    answer: "Use the STAR format: Situation, Task, Action, and Result, with measurable outcomes if possible."
  },
  {
    text: "Where do you see yourself in five years?",
    answer: "Show growth intent aligned with the role, such as becoming a strong contributor, then mentoring and leading initiatives."
  },
  {
    text: "How do you handle pressure and deadlines?",
    answer: "Explain your planning method, prioritization, and communication approach, plus one instance where you met a tight deadline."
  },
  {
    text: "Why do you want to work with our company?",
    answer: "Reference the company mission, product, or culture and connect it directly with your interests and long-term goals."
  }
].map((question, index) => ({
  id: `hr-${index + 1}`,
  category: "HR",
  text: question.text,
  answer: question.answer
}));

const TECH_QUESTIONS = [
  ["Java", "What is the difference between JDK, JRE, and JVM?", "JDK includes tools and JRE; JRE provides runtime libraries; JVM executes bytecode on the machine."],
  ["Java", "Explain method overloading vs overriding.", "Overloading changes parameter list in the same class; overriding redefines inherited behavior with same signature."],
  ["JavaScript", "Explain event bubbling and event delegation.", "Events bubble from child to parent; delegation uses a parent listener to handle child events efficiently."],
  ["JavaScript", "What are closures and how are they used?", "A closure keeps access to lexical scope after outer function execution, useful for data privacy and factories."],
  ["React", "What is the virtual DOM in React?", "It is a lightweight UI tree React diffs against previous state to apply minimal updates to real DOM."],
  ["React", "Difference between state and props?", "Props are read-only inputs from parent; state is mutable internal data managed by the component."],
  ["Node.js", "What is the event loop in Node.js?", "It handles asynchronous callbacks in phases, enabling non-blocking I/O on a single thread."],
  ["Node.js", "How does middleware work in Express?", "Middleware runs in sequence for each request and can modify req/res or pass control via next()."],
  ["DBMS", "What is normalization and why is it used?", "Normalization organizes tables to reduce redundancy and improve data integrity using normal forms."],
  ["DBMS", "Explain ACID properties in a database transaction.", "Atomicity, Consistency, Isolation, Durability ensure reliable and correct transaction processing."],
  ["Operating Systems", "Difference between process and thread?", "A process has isolated memory and resources; threads share process memory and execute concurrently."],
  ["Operating Systems", "What is deadlock and how can it be avoided?", "Deadlock is cyclic waiting for resources; avoid it by preventing circular wait or using resource ordering."],
  ["Computer Networks", "Explain the OSI model layers.", "Physical, Data Link, Network, Transport, Session, Presentation, Application separate communication responsibilities."],
  ["Computer Networks", "Difference between TCP and UDP?", "TCP is connection-oriented and reliable; UDP is connectionless, faster, and best-effort delivery."]
].map((item, index) => ({
  id: `tech-${index + 1}`,
  category: item[0],
  text: item[1],
  answer: item[2]
}));

const QUESTION_BANK = [...HR_QUESTIONS, ...TECH_QUESTIONS];

const state = {
  bookmarkedQuestions: readStorage(STORAGE_KEYS.bookmarkedQuestions, []),
  completedQuestions: readStorage(STORAGE_KEYS.completedQuestions, []),
  notes: readStorage(STORAGE_KEYS.notes, []),
  resources: readStorage(STORAGE_KEYS.resources, []),
  progress: readStorage(STORAGE_KEYS.progress, DEFAULT_PROGRESS),
  mockInterviewHistory: readStorage(STORAGE_KEYS.mockInterviewHistory, []),
  dailyQuestion: readStorage(STORAGE_KEYS.dailyQuestion, null),
  streakData: readStorage(STORAGE_KEYS.streakData, { lastActiveDate: null, count: 0 }),
  activeMockQuestion: "",
  mockTimerSeconds: 0,
  mockTimerInterval: null
};

function readStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return structuredClone(fallbackValue);
    }
    return JSON.parse(raw);
  } catch (error) {
    return structuredClone(fallbackValue);
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(dateInput = new Date()) {
  const date = new Date(dateInput);
  return date.toISOString().slice(0, 10);
}

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function updateStreak() {
  const today = formatDate();
  const lastActiveDate = state.streakData.lastActiveDate;

  if (!lastActiveDate) {
    state.streakData = { lastActiveDate: today, count: 1 };
  } else {
    const todayDate = new Date(`${today}T00:00:00`);
    const lastDate = new Date(`${lastActiveDate}T00:00:00`);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.streakData.count += 1;
      state.streakData.lastActiveDate = today;
    } else if (diffDays > 1) {
      state.streakData = { lastActiveDate: today, count: 1 };
    }
  }

  writeStorage(STORAGE_KEYS.streakData, state.streakData);
}

function ensureDailyQuestion() {
  const today = formatDate();
  if (state.dailyQuestion && state.dailyQuestion.date === today) {
    return;
  }

  const randomQuestion = QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
  state.dailyQuestion = {
    date: today,
    questionId: randomQuestion.id,
    text: randomQuestion.text
  };

  writeStorage(STORAGE_KEYS.dailyQuestion, state.dailyQuestion);
}

function isBookmarked(questionId) {
  return state.bookmarkedQuestions.includes(questionId);
}

function isCompleted(questionId) {
  return state.completedQuestions.includes(questionId);
}

function toggleInArray(arr, value) {
  if (arr.includes(value)) {
    return arr.filter((item) => item !== value);
  }
  return [...arr, value];
}

function setSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  const title = document.querySelector(`.nav-item[data-section="${sectionId}"]`)?.textContent?.trim() || "Dashboard";
  document.getElementById("sectionTitle").textContent = title;

  const subtitleMap = {
    dashboard: "Track your interview preparation journey.",
    hrQuestions: "Practice core HR interview questions.",
    technicalQuestions: "Sharpen technical interview readiness.",
    notes: "Capture and revisit your key concepts.",
    resources: "Store and organize preparation material.",
    progressTracker: "Measure progress category by category.",
    mockInterview: "Simulate real interview situations.",
    settings: "Customize your app preferences."
  };

  document.getElementById("sectionSubtitle").textContent = subtitleMap[sectionId] || "";
}

function renderDashboard() {
  const totalCompletedQuestions = state.completedQuestions.length;
  const totalBookmarked = state.bookmarkedQuestions.length;
  const notesCount = state.notes.length;
  const resourcesCount = state.resources.length;
  const progressValues = Object.values(state.progress);
  const averageProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, value) => sum + Number(value), 0) / progressValues.length)
    : 0;

  document.getElementById("statQuestionsStudied").textContent = String(totalCompletedQuestions);
  document.getElementById("statBookmarked").textContent = String(totalBookmarked);
  document.getElementById("statNotes").textContent = String(notesCount);
  document.getElementById("statResources").textContent = String(resourcesCount);
  document.getElementById("statProgress").textContent = `${averageProgress}%`;
  document.getElementById("statStreak").textContent = `${state.streakData.count} day${state.streakData.count === 1 ? "" : "s"}`;

  const dailyQuestionText = state.dailyQuestion?.text || "No daily question yet.";
  document.getElementById("dailyQuestionText").textContent = dailyQuestionText;
}

function getFilteredQuestions(list, searchTerm, statusFilter, categoryFilter) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return list.filter((question) => {
    const matchesSearch = !normalizedSearch || `${question.text} ${question.answer || ""}`.toLowerCase().includes(normalizedSearch);
    const matchesCategory = !categoryFilter || categoryFilter === "all" || question.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "completed") {
      matchesStatus = isCompleted(question.id);
    } else if (statusFilter === "bookmarked") {
      matchesStatus = isBookmarked(question.id);
    } else if (statusFilter === "pending") {
      matchesStatus = !isCompleted(question.id);
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function renderQuestions(list, containerId) {
  const container = document.getElementById(containerId);
  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No questions found for this filter.</div>';
    return;
  }

  container.innerHTML = list
    .map((question) => {
      const bookmarked = isBookmarked(question.id);
      const completed = isCompleted(question.id);

      return `
        <article class="question-card">
          <h4>${safeText(question.text)}</h4>
          <div class="answer-box">
            <strong>Suggested Answer</strong>
            <p>${safeText(question.answer || "No answer available.")}</p>
          </div>
          <div class="meta-row">
            <span class="badge">${safeText(question.category)}</span>
            ${completed ? '<span class="badge success">Completed</span>' : ""}
            ${bookmarked ? '<span class="badge">Bookmarked</span>' : ""}
          </div>
          <div class="actions-row">
            <button class="btn ghost" data-action="bookmark" data-id="${question.id}">
              <i class="fa-${bookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
              <span>${bookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>
            <button class="btn primary" data-action="complete" data-id="${question.id}">
              <i class="fa-solid ${completed ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
              <span>${completed ? "Mark Pending" : "Mark Completed"}</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderHRQuestions() {
  const search = document.getElementById("hrSearch").value || "";
  const status = document.getElementById("hrFilterStatus").value;
  const filtered = getFilteredQuestions(HR_QUESTIONS, search, status);
  renderQuestions(filtered, "hrQuestionList");
}

function renderTechQuestions() {
  const search = document.getElementById("techSearch").value || "";
  const status = document.getElementById("techFilterStatus").value;
  const category = document.getElementById("techFilterCategory").value;
  const filtered = getFilteredQuestions(TECH_QUESTIONS, search, status, category);
  renderQuestions(filtered, "techQuestionList");
}

function renderNotes() {
  const searchTerm = (document.getElementById("noteSearch").value || "").trim().toLowerCase();
  const notesList = document.getElementById("notesList");

  const filteredNotes = state.notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  });

  if (!filteredNotes.length) {
    notesList.innerHTML = '<div class="empty-state">No notes available.</div>';
    return;
  }

  notesList.innerHTML = filteredNotes
    .map((note) => {
      return `
        <article class="note-card">
          <h4>${safeText(note.title)}</h4>
          <p>${safeText(note.content)}</p>
          <div class="meta-row">
            <span class="badge">${safeText(note.createdAt)}</span>
          </div>
          <div class="actions-row">
            <button class="btn ghost" data-action="edit-note" data-id="${note.id}">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Edit</span>
            </button>
            <button class="btn danger" data-action="delete-note" data-id="${note.id}">
              <i class="fa-solid fa-trash-can"></i>
              <span>Delete</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function extractYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) {
      return shortsMatch[1];
    }
  } catch (error) {
    return "";
  }
  return "";
}

function extractPlaylistId(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list") || "";
  } catch (error) {
    return "";
  }
}

function resolveResourceThumbnail(resource) {
  if (resource.type === "youtube") {
    return resource.thumbnail;
  }
  if (resource.thumbnail) {
    return resource.thumbnail;
  }
  return "https://dummyimage.com/640x360/1f2937/ffffff&text=Interview+Resource";
}

function renderResources() {
  const resourceList = document.getElementById("resourceList");

  if (!state.resources.length) {
    resourceList.innerHTML = '<div class="empty-state">No resources saved yet.</div>';
    return;
  }

  resourceList.innerHTML = state.resources
    .slice()
    .reverse()
    .map((resource) => {
      const thumb = resolveResourceThumbnail(resource);
      return `
        <article class="resource-card">
          <img class="resource-thumb" src="${safeText(thumb)}" alt="${safeText(resource.title)}" loading="lazy" />
          <h4>${safeText(resource.title)}</h4>
          <p>${safeText(resource.type.toUpperCase())}</p>
          <div class="actions-row">
            <a class="btn primary" href="${safeText(resource.url)}" target="_blank" rel="noopener noreferrer">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Open</span>
            </a>
            <button class="btn danger" data-action="delete-resource" data-id="${resource.id}">
              <i class="fa-solid fa-trash-can"></i>
              <span>Delete</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProgress() {
  const wrapper = document.getElementById("progressControls");

  wrapper.innerHTML = Object.entries(state.progress)
    .map(([category, value]) => {
      const numeric = Number(value) || 0;
      return `
        <div class="progress-item">
          <div class="progress-label">
            <span>${safeText(category)}</span>
            <span>${numeric}%</span>
          </div>
          <input type="range" min="0" max="100" value="${numeric}" data-action="progress-range" data-category="${safeText(category)}" />
          <div class="progress-track">
            <div class="progress-fill" style="width:${numeric}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  const progressValues = Object.values(state.progress).map((value) => Number(value) || 0);
  const overall = progressValues.length
    ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
    : 0;

  const overallCircle = document.getElementById("overallCircle");
  overallCircle.innerHTML = `<span>${overall}%</span>`;
  overallCircle.style.setProperty('--progress', overall);
}

function renderMockHistory() {
  const historyList = document.getElementById("mockHistoryList");
  if (!state.mockInterviewHistory.length) {
    historyList.innerHTML = '<div class="empty-state">No mock interview practice history yet.</div>';
    return;
  }

  historyList.innerHTML = state.mockInterviewHistory
    .slice()
    .reverse()
    .map((entry) => {
      return `
        <article class="note-card">
          <h4>${safeText(entry.question)}</h4>
          <p>${safeText(entry.answer || "(No answer recorded)")}</p>
          <div class="meta-row">
            <span class="badge">${safeText(entry.date)}</span>
            <span class="badge">${safeText(entry.timerLabel)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderGlobalSearchResults(query) {
  const resultBox = document.getElementById("searchResults");
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    resultBox.classList.remove("open");
    resultBox.innerHTML = "";
    return;
  }

  const questionMatches = QUESTION_BANK
    .filter((question) => `${question.text} ${question.answer || ""}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((question) => ({
      type: "Question",
      section: question.category === "HR" ? "hrQuestions" : "technicalQuestions",
      title: question.text
    }));

  const noteMatches = state.notes
    .filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(normalized))
    .slice(0, 3)
    .map((note) => ({
      type: "Note",
      section: "notes",
      title: note.title
    }));

  const resourceMatches = state.resources
    .filter((resource) => `${resource.title} ${resource.url}`.toLowerCase().includes(normalized))
    .slice(0, 3)
    .map((resource) => ({
      type: "Resource",
      section: "resources",
      title: resource.title
    }));

  const allMatches = [...questionMatches, ...noteMatches, ...resourceMatches];

  if (!allMatches.length) {
    resultBox.classList.add("open");
    resultBox.innerHTML = '<div class="search-item">No matches found.</div>';
    return;
  }

  resultBox.classList.add("open");
  resultBox.innerHTML = allMatches
    .map(
      (item) => `
      <div class="search-item" data-action="jump-section" data-section="${safeText(item.section)}">
        ${safeText(item.title)}
        <small>${safeText(item.type)}</small>
      </div>
    `
    )
    .join("");
}

function syncQuestionStorage() {
  writeStorage(STORAGE_KEYS.bookmarkedQuestions, state.bookmarkedQuestions);
  writeStorage(STORAGE_KEYS.completedQuestions, state.completedQuestions);
  renderHRQuestions();
  renderTechQuestions();
  renderDashboard();
}

function resetNoteForm() {
  document.getElementById("noteId").value = "";
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";
}

function setTheme(themeName) {
  document.body.setAttribute("data-theme", themeName);
  writeStorage(STORAGE_KEYS.theme, themeName);
}

function formatTimer(seconds) {
  const min = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function stopMockTimer() {
  if (state.mockTimerInterval) {
    clearInterval(state.mockTimerInterval);
    state.mockTimerInterval = null;
  }
}

function startMockTimer() {
  stopMockTimer();
  const selectedSeconds = Number(document.getElementById("mockTimerSelect").value);
  state.mockTimerSeconds = selectedSeconds;

  const display = document.getElementById("mockTimerDisplay");
  display.textContent = formatTimer(state.mockTimerSeconds);

  state.mockTimerInterval = setInterval(() => {
    state.mockTimerSeconds -= 1;
    display.textContent = formatTimer(Math.max(state.mockTimerSeconds, 0));

    if (state.mockTimerSeconds <= 0) {
      stopMockTimer();
      display.textContent = "00:00";
    }
  }, 1000);
}

function bindEvents() {
  document.getElementById("navLinks").addEventListener("click", (event) => {
    const button = event.target.closest(".nav-item");
    if (!button) {
      return;
    }

    setSection(button.dataset.section);
    document.getElementById("sidebar").classList.remove("open");
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.getElementById("refreshDailyQuestion").addEventListener("click", () => {
    alert("Daily question is fixed for today and will refresh tomorrow automatically.");
  });

  document.getElementById("hrSearch").addEventListener("input", renderHRQuestions);
  document.getElementById("hrFilterStatus").addEventListener("change", renderHRQuestions);
  document.getElementById("techSearch").addEventListener("input", renderTechQuestions);
  document.getElementById("techFilterStatus").addEventListener("change", renderTechQuestions);
  document.getElementById("techFilterCategory").addEventListener("change", renderTechQuestions);

  ["hrQuestionList", "techQuestionList"].forEach((listId) => {
    document.getElementById(listId).addEventListener("click", (event) => {
      const actionElement = event.target.closest("[data-action]");
      if (!actionElement) {
        return;
      }

      const action = actionElement.dataset.action;
      const questionId = actionElement.dataset.id;

      if (action === "bookmark") {
        state.bookmarkedQuestions = toggleInArray(state.bookmarkedQuestions, questionId);
        syncQuestionStorage();
      }

      if (action === "complete") {
        state.completedQuestions = toggleInArray(state.completedQuestions, questionId);
        syncQuestionStorage();
      }
    });
  });

  document.getElementById("noteForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const noteId = document.getElementById("noteId").value;
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
      return;
    }

    if (noteId) {
      state.notes = state.notes.map((note) => {
        if (note.id === Number(noteId)) {
          return {
            ...note,
            title,
            content
          };
        }
        return note;
      });
    } else {
      state.notes.push({
        id: Date.now(),
        title,
        content,
        createdAt: formatDate()
      });
    }

    writeStorage(STORAGE_KEYS.notes, state.notes);
    resetNoteForm();
    renderNotes();
    renderDashboard();
  });

  document.getElementById("cancelEditNote").addEventListener("click", resetNoteForm);
  document.getElementById("noteSearch").addEventListener("input", renderNotes);

  document.getElementById("notesList").addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const noteId = Number(actionElement.dataset.id);
    const note = state.notes.find((item) => item.id === noteId);

    if (action === "edit-note" && note) {
      document.getElementById("noteId").value = String(note.id);
      document.getElementById("noteTitle").value = note.title;
      document.getElementById("noteContent").value = note.content;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (action === "delete-note") {
      state.notes = state.notes.filter((item) => item.id !== noteId);
      writeStorage(STORAGE_KEYS.notes, state.notes);
      renderNotes();
      renderDashboard();
    }
  });

  document.getElementById("resourceType").addEventListener("change", (event) => {
    const thumbnailInput = document.getElementById("resourceThumbnail");
    const selectedType = event.target.value;
    thumbnailInput.style.display = selectedType === "playlist" ? "block" : "none";
  });

  document.getElementById("resourceForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const type = document.getElementById("resourceType").value;
    const title = document.getElementById("resourceTitle").value.trim();
    const url = document.getElementById("resourceUrl").value.trim();
    const customThumbnail = document.getElementById("resourceThumbnail").value.trim();

    if (!title || !url) {
      return;
    }

    let thumbnail = customThumbnail;

    if (type === "youtube") {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        alert("Invalid YouTube video URL.");
        return;
      }
      thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (type === "playlist") {
      const playlistId = extractPlaylistId(url);
      if (!playlistId) {
        alert("Invalid playlist URL. Make sure it has list= parameter.");
        return;
      }
    }

    state.resources.push({
      id: Date.now(),
      title,
      url,
      type,
      thumbnail,
      createdAt: formatDate()
    });

    writeStorage(STORAGE_KEYS.resources, state.resources);
    document.getElementById("resourceForm").reset();
    document.getElementById("resourceThumbnail").style.display = "none";
    renderResources();
    renderDashboard();
  });

  document.getElementById("resourceList").addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    if (actionElement.dataset.action === "delete-resource") {
      const resourceId = Number(actionElement.dataset.id);
      state.resources = state.resources.filter((resource) => resource.id !== resourceId);
      writeStorage(STORAGE_KEYS.resources, state.resources);
      renderResources();
      renderDashboard();
    }
  });

  document.getElementById("progressControls").addEventListener("input", (event) => {
    const input = event.target.closest('[data-action="progress-range"]');
    if (!input) {
      return;
    }

    const category = input.dataset.category;
    state.progress[category] = Number(input.value);
    writeStorage(STORAGE_KEYS.progress, state.progress);
    renderProgress();
    renderDashboard();
  });

  document.getElementById("generateMockQuestion").addEventListener("click", () => {
    const random = QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
    state.activeMockQuestion = random.text;
    document.getElementById("mockQuestionText").textContent = random.text;
  });

  document.getElementById("startMockTimer").addEventListener("click", startMockTimer);

  document.getElementById("saveMockAnswer").addEventListener("click", () => {
    const answer = document.getElementById("mockAnswer").value.trim();
    const timerValue = Number(document.getElementById("mockTimerSelect").value);

    if (!state.activeMockQuestion) {
      alert("Generate a question before saving.");
      return;
    }

    state.mockInterviewHistory.push({
      id: Date.now(),
      question: state.activeMockQuestion,
      answer,
      timerLabel: formatTimer(timerValue),
      date: formatDate()
    });

    writeStorage(STORAGE_KEYS.mockInterviewHistory, state.mockInterviewHistory);
    document.getElementById("mockAnswer").value = "";
    renderMockHistory();
  });

  document.getElementById("themeLight").addEventListener("click", () => setTheme("light"));
  document.getElementById("themeDark").addEventListener("click", () => setTheme("dark"));

  document.getElementById("resetDataBtn").addEventListener("click", () => {
    document.getElementById("confirmModal").classList.remove("hidden");
  });

  document.getElementById("cancelReset").addEventListener("click", () => {
    document.getElementById("confirmModal").classList.add("hidden");
  });

  document.getElementById("confirmReset").addEventListener("click", () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  });

  const globalSearch = document.getElementById("globalSearch");
  globalSearch.addEventListener("input", (event) => {
    renderGlobalSearchResults(event.target.value);
  });

  document.getElementById("searchResults").addEventListener("click", (event) => {
    const jumpTarget = event.target.closest('[data-action="jump-section"]');
    if (!jumpTarget) {
      return;
    }

    setSection(jumpTarget.dataset.section);
    document.getElementById("searchResults").classList.remove("open");
    document.getElementById("globalSearch").value = "";
  });

  document.addEventListener("click", (event) => {
    const results = document.getElementById("searchResults");
    const searchWrap = document.querySelector(".search-wrap");
    if (!searchWrap.contains(event.target)) {
      results.classList.remove("open");
    }
  });
}

function initialize() {
  updateStreak();
  ensureDailyQuestion();

  const savedTheme = readStorage(STORAGE_KEYS.theme, "light");
  setTheme(savedTheme);

  document.getElementById("resourceThumbnail").style.display = "none";
  document.getElementById("mockTimerDisplay").textContent = "00:00";

  renderDashboard();
  renderHRQuestions();
  renderTechQuestions();
  renderNotes();
  renderResources();
  renderProgress();
  renderMockHistory();
  bindEvents();
}

initialize();
