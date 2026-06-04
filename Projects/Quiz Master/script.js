/* --- Premium Quiz Master JavaScript Logic --- */

document.addEventListener('DOMContentLoaded', () => {

  // --- MOCK QUESTIONS DATABASE ---
  const QUIZ_QUESTIONS = {
    JavaScript: [
      { id: 'js1', difficulty: 'easy', text: 'Which keyword is used to declare a block-scoped variable in JavaScript?', options: ['var', 'let', 'const', 'both let and const'], correct: 3 },
      { id: 'js2', difficulty: 'easy', text: 'How do you write "Hello World" in an alert box?', options: ['msgBox("Hello World");', 'alertBox("Hello World");', 'alert("Hello World");', 'msg("Hello World");'], correct: 2 },
      { id: 'js3', difficulty: 'medium', text: 'What is the correct way to check if a value is NaN?', options: ['myVal === NaN', 'myVal == NaN', 'isNaN(myVal)', 'myVal.isNaN()'], correct: 2 },
      { id: 'js4', difficulty: 'medium', text: 'Which method adds one or more elements to the end of an array?', options: ['pop()', 'push()', 'shift()', 'unshift()'], correct: 1 },
      { id: 'js5', difficulty: 'hard', text: 'What is the output of: console.log(typeof null);', options: ['"null"', '"undefined"', '"object"', '"function"'], correct: 2 }
    ],
    React: [
      { id: 're1', difficulty: 'easy', text: 'What is the hook used to manage state inside functional components?', options: ['useEffect', 'useReducer', 'useState', 'useContext'], correct: 2 },
      { id: 're2', difficulty: 'easy', text: 'How do you pass data down to child components in React?', options: ['State', 'Props', 'Redux', 'Context'], correct: 1 },
      { id: 're3', difficulty: 'medium', text: 'What is the virtual DOM in React?', options: ['A direct copy of the HTML Document object model', 'A lightweight client-side representation of the real DOM', 'An extension for chrome dev tools', 'A database wrapper'], correct: 1 },
      { id: 're4', difficulty: 'medium', text: 'Which hook should be used to memoize expensive computations?', options: ['useCallback', 'useMemo', 'useRef', 'useEffect'], correct: 1 },
      { id: 're5', difficulty: 'hard', text: 'What does the useEffect dependency array specify?', options: ['The order of rendering execution', 'The props or states that trigger the effect to re-run', 'A list of callback components', 'None of the above'], correct: 1 }
    ],
    HTML: [
      { id: 'ht1', difficulty: 'easy', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Mark Language'], correct: 0 },
      { id: 'ht2', difficulty: 'easy', text: 'Choose the correct HTML element for the largest heading:', options: ['&lt;heading&gt;', '&lt;h6&gt;', '&lt;h1&gt;', '&lt;head&gt;'], correct: 2 },
      { id: 'ht3', difficulty: 'medium', text: 'Which HTML5 element is used to display scalable vector graphics?', options: ['&lt;canvas&gt;', '&lt;svg&gt;', '&lt;vector&gt;', '&lt;graphics&gt;'], correct: 1 },
      { id: 'ht4', difficulty: 'medium', text: 'What is the correct HTML element for playing audio files?', options: ['&lt;sound&gt;', '&lt;play&gt;', '&lt;audio&gt;', '&lt;music&gt;'], correct: 2 },
      { id: 'ht5', difficulty: 'hard', text: 'Which attribute is used to reference dynamic styles or scripting maps in modern headers?', options: ['rel', 'manifest', 'integrity', 'crossorigin'], correct: 0 }
    ],
    CSS: [
      { id: 'cs1', difficulty: 'easy', text: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correct: 1 },
      { id: 'cs2', difficulty: 'easy', text: 'Which CSS property controls the text size?', options: ['text-size', 'font-style', 'font-size', 'text-style'], correct: 2 },
      { id: 'cs3', difficulty: 'medium', text: 'Which CSS property is used to change the background color of an element?', options: ['color', 'background-color', 'bgcolor', 'fill'], correct: 1 },
      { id: 'cs4', difficulty: 'medium', text: 'What is the default value of the position property in CSS?', options: ['absolute', 'relative', 'static', 'fixed'], correct: 2 },
      { id: 'cs5', difficulty: 'hard', text: 'How does the flex-grow property behave?', options: ['Defines the ability of a flex item to shrink', 'Defines the default size of a flex item before spacing', 'Defines the ability for a flex item to grow if space is available', 'None of the above'], correct: 2 }
    ],
    Python: [
      { id: 'py1', difficulty: 'easy', text: 'What is the correct extension for Python files?', options: ['.pyt', '.py', '.pyw', '.python'], correct: 1 },
      { id: 'py2', difficulty: 'easy', text: 'How do you create a variable in Python?', options: ['var x = 5', 'int x = 5', 'x = 5', 'let x = 5'], correct: 2 },
      { id: 'py3', difficulty: 'medium', text: 'Which collection in Python is ordered, changeable, and allows duplicate members?', options: ['Set', 'Dictionary', 'List', 'Tuple'], correct: 2 },
      { id: 'py4', difficulty: 'medium', text: 'How do you start writing a function block in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], correct: 1 },
      { id: 'py5', difficulty: 'hard', text: 'What is the output of: len(set([1, 2, 2, 3, 3, 3]))', options: ['6', '3', '4', '5'], correct: 1 }
    ]
  };

  // Category Icons & Config for dynamic list
  const CATEGORIES = [
    { key: 'JavaScript', name: 'JavaScript', icon: '💛', count: '5 Questions', desc: 'Syntax, Scopes, Objects & ES6 hooks.' },
    { key: 'React', name: 'React', icon: '⚛️', count: '5 Questions', desc: 'Virtual DOM, Props, States & Hooks.' },
    { key: 'HTML', name: 'HTML', icon: '🧡', count: '5 Questions', desc: 'Semantic tags, tags schema, and elements.' },
    { key: 'CSS', name: 'CSS', icon: '💙', count: '5 Questions', desc: 'Flexbox, CSS selectors, layout positions.' },
    { key: 'Python', name: 'Python', icon: '🐍', count: '5 Questions', desc: 'Lists, Functions, loops & variables.' }
  ];

  // --- MOCK USERS & PERSISTENCE SERVICES ---

  const getUsersDb = () => {
    const db = localStorage.getItem('quiz_users_db');
    return db ? JSON.parse(db) : {};
  };

  const saveUsersDb = (db) => {
    localStorage.setItem('quiz_users_db', JSON.stringify(db));
  };

  const getSession = () => {
    return localStorage.getItem('quiz_active_session');
  };

  const saveSession = (email) => {
    localStorage.setItem('quiz_active_session', email);
  };

  const clearSession = () => {
    localStorage.removeItem('quiz_active_session');
  };

  // --- BOT USERS SEED FOR LEADERBOARD ---
  const BOT_USERS = [
    { name: 'ByteSize', score: 320 },
    { name: 'CodeCrusher', score: 280 },
    { name: 'AlgoWiz', score: 210 }
  ];

  // Achievements profiles
  const ACHIEVEMENT_BADGES = [
    { id: 'badge1', name: 'First Step', desc: 'Complete any quiz session', icon: '🏅' },
    { id: 'badge2', name: 'Century Club', desc: 'Amass 100 total points', icon: '💯' },
    { id: 'badge3', name: 'Perfect Score', desc: 'Score 100% accuracy', icon: '🎯' },
    { id: 'badge4', name: 'Fast Learner', desc: 'Answer with >15s left', icon: '⚡' }
  ];

  let currentUserEmail = null;
  let userProfile = {};
  let currentQuizQuestions = [];
  let currentQuestionIndex = 0;
  let correctAnswersCount = 0;
  let timerInterval = null;
  let maxTime = 30;
  let timeLeft = 30;
  let fastAnswered = false;

  // --- DOM Selection ---
  const authView = document.getElementById('authView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginTabBtn = document.getElementById('loginTabBtn');
  const signupTabBtn = document.getElementById('signupTabBtn');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const logoutBtn = document.getElementById('logoutBtn');

  const profileNameLabel = document.getElementById('profileNameLabel');
  const profilePointsLabel = document.getElementById('profilePointsLabel');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarUploadInput = document.getElementById('avatarUploadInput');

  const tabTitle = document.getElementById('tabTitle');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  const categoriesGrid = document.getElementById('categoriesGrid');
  const quizDifficulty = document.getElementById('quizDifficulty');
  const quizTimer = document.getElementById('quizTimer');

  const aiPromptForm = document.getElementById('aiPromptForm');
  const aiTopic = document.getElementById('aiTopic');
  const aiDifficulty = document.getElementById('aiDifficulty');
  const aiCount = document.getElementById('aiCount');

  const leaderboardList = document.getElementById('leaderboardList');
  const achievementsGrid = document.getElementById('achievementsGrid');
  const historyList = document.getElementById('historyList');

  // Account Settings
  const changePasswordForm = document.getElementById('changePasswordForm');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const passwordSuccessMsg = document.getElementById('passwordSuccessMsg');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  // Quiz active view components
  const quizGameplayView = document.getElementById('quizGameplayView');
  const activeCategoryBadge = document.getElementById('activeCategoryBadge');
  const activeProgressLabel = document.getElementById('activeProgressLabel');
  const progressBarFill = document.getElementById('progressBarFill');
  const questionText = document.getElementById('questionText');
  const optionsGrid = document.getElementById('optionsGrid');
  
  const timerContainer = document.getElementById('timerContainer');
  const timerProgressRing = document.getElementById('timerProgressRing');
  const timerCountLabel = document.getElementById('timerCountLabel');
  const exitQuizBtn = document.getElementById('exitQuizBtn');

  const quizResultPanel = document.getElementById('quizResultPanel');
  const resultScoreText = document.getElementById('resultScoreText');
  const resultSubtitle = document.getElementById('resultSubtitle');
  const resultCorrectCount = document.getElementById('resultCorrectCount');
  const resultAccuracy = document.getElementById('resultAccuracy');
  const resultDoneBtn = document.getElementById('resultDoneBtn');

  // --- AUTH ROUTER AND SESSION SYSTEM ---

  const initSession = (email) => {
    currentUserEmail = email;
    const db = getUsersDb();
    userProfile = db[email];

    profileNameLabel.textContent = userProfile.name;
    profilePointsLabel.textContent = `${userProfile.totalScore || 0} PTS`;
    
    // Set avatar
    if (userProfile.avatarUrl) {
      avatarPreview.innerHTML = `<img src="${userProfile.avatarUrl}" alt="Profile avatar">`;
    } else {
      avatarPreview.innerHTML = userProfile.name.substring(0, 2).toUpperCase();
    }

    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');

    renderCategories();
    renderLeaderboard();
    renderAchievements();
    renderHistory();
  };

  const terminateSession = () => {
    clearSession();
    currentUserEmail = null;
    dashboardView.classList.add('hidden');
    authView.classList.remove('hidden');
  };

  // Signup/Login panel switches
  loginTabBtn.addEventListener('click', () => {
    loginTabBtn.classList.add('active');
    signupTabBtn.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  });

  signupTabBtn.addEventListener('click', () => {
    signupTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const db = getUsersDb();

    if (db[email] && db[email].password === password) {
      saveSession(email);
      initSession(email);
    } else {
      loginError.textContent = 'Invalid email or password credentials.';
    }
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const db = getUsersDb();

    if (db[email]) {
      signupError.textContent = 'An account with this email already exists.';
      return;
    }
    if (password.length < 6) {
      signupError.textContent = 'Password must be at least 6 characters.';
      return;
    }

    db[email] = {
      name,
      password,
      totalScore: 0,
      history: [],
      unlockedBadges: [],
      avatarUrl: ''
    };
    saveUsersDb(db);

    saveSession(email);
    initSession(email);
  });

  logoutBtn.addEventListener('click', terminateSession);

  // Avatar Image Upload
  avatarUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        userProfile.avatarUrl = dataUrl;

        // Save DB
        const db = getUsersDb();
        db[currentUserEmail] = userProfile;
        saveUsersDb(db);

        // Update preview
        avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Avatar">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // --- DASHBOARD ROUTER NAVIGATION ---

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      item.classList.add('active');
      const target = item.getAttribute('data-target');
      document.getElementById(target).classList.add('active');

      tabTitle.textContent = item.textContent.trim();
    });
  });

  // Toggle Dark/Light mode theme
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  });

  // --- RENDER SECTIONS DATA COMPILERS ---

  // Categories render
  const renderCategories = () => {
    categoriesGrid.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `
        <div class="category-icon">${cat.icon}</div>
        <div class="category-info">
          <h4>${cat.name}</h4>
          <p>${cat.desc}</p>
        </div>
      `;
      card.addEventListener('click', () => startQuiz(cat.key));
      categoriesGrid.appendChild(card);
    });
  };

  // Leaderboard render
  const renderLeaderboard = () => {
    leaderboardList.innerHTML = '';
    const db = getUsersDb();
    
    // Fetch users and map to profiles
    const users = Object.keys(db).map(email => ({
      name: db[email].name,
      score: db[email].totalScore || 0
    }));

    // Concat Bots for empty board premium layouts
    const merged = [...users, ...BOT_USERS];
    // Sort descending
    merged.sort((a, b) => b.score - a.score);

    merged.forEach((user, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'leaderboard-row';
      
      const rank = idx + 1;
      let badgeClass = '';
      if (rank <= 3) badgeClass = `rank-${rank}`;

      tr.innerHTML = `
        <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
        <td style="font-weight: 700;">${user.name}</td>
        <td align="right" style="font-weight: 800; color: var(--accent-orange);">${user.score} PTS</td>
      `;
      leaderboardList.appendChild(tr);
    });
  };

  // Achievements Badges rendering
  const renderAchievements = () => {
    achievementsGrid.innerHTML = '';
    const unlocked = userProfile.unlockedBadges || [];

    ACHIEVEMENT_BADGES.forEach(badge => {
      const card = document.createElement('div');
      const isUnlocked = unlocked.includes(badge.id);
      card.className = `achievement-badge ${isUnlocked ? 'unlocked' : ''}`;

      card.innerHTML = `
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.desc}</span>
      `;
      achievementsGrid.appendChild(card);
    });
  };

  // History tables logs rendering
  const renderHistory = () => {
    historyList.innerHTML = '';
    const history = userProfile.history || [];

    if (history.length === 0) {
      historyList.innerHTML = `<tr><td colspan="5" align="center" style="color: var(--text-muted);">No history data found. Play a quiz session first!</td></tr>`;
      return;
    }

    // Sort newest date first
    const sorted = [...history].reverse();

    sorted.forEach(log => {
      const tr = document.createElement('tr');
      tr.className = 'history-row';

      tr.innerHTML = `
        <td style="font-weight: 700;">${log.subject}</td>
        <td style="text-transform: capitalize;">${log.difficulty}</td>
        <td style="font-weight: 600; color: var(--accent-orange);">${log.accuracy}%</td>
        <td style="font-weight: 800;">${log.score}</td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${log.date}</td>
      `;
      historyList.appendChild(tr);
    });
  };

  // --- CORE GAMEPLAY RUNNER SYSTEMS ---

  const startQuiz = (categoryKey, customQuestions = null) => {
    // Select questions
    const diff = quizDifficulty.value;
    const baseTimer = parseInt(quizTimer.value);
    maxTime = baseTimer;
    timeLeft = baseTimer;
    correctAnswersCount = 0;
    currentQuestionIndex = 0;
    fastAnswered = false;

    if (customQuestions) {
      currentQuizQuestions = customQuestions;
      activeCategoryBadge.textContent = 'Custom AI Quiz';
    } else {
      const allSubjectQuestions = QUIZ_QUESTIONS[categoryKey] || [];
      // Filter by difficulty level
      currentQuizQuestions = allSubjectQuestions.filter(q => q.difficulty === diff);
      
      // Fallback if no questions matched difficulty
      if (currentQuizQuestions.length === 0) {
        currentQuizQuestions = allSubjectQuestions;
      }
      activeCategoryBadge.textContent = categoryKey;
    }

    if (currentQuizQuestions.length === 0) {
      alert('No questions configured in this subject level.');
      return;
    }

    // Launch UI Overlay
    quizGameplayView.classList.remove('hidden');
    quizResultPanel.classList.add('hidden');

    loadQuestion();
  };

  const loadQuestion = () => {
    // Reset timer progress
    clearInterval(timerInterval);
    timeLeft = maxTime;

    if (maxTime > 0) {
      timerContainer.classList.remove('hidden');
      timerCountLabel.textContent = timeLeft;
      updateTimerRing();

      // Trigger interval countdown
      timerInterval = setInterval(() => {
        timeLeft--;
        timerCountLabel.textContent = timeLeft;
        updateTimerRing();

        if (timeLeft <= 5) {
          timerContainer.classList.add('timer-low');
        } else {
          timerContainer.classList.remove('timer-low');
        }

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          handleTimeOut();
        }
      }, 1000);
    } else {
      timerContainer.classList.add('hidden');
    }

    // Set progress bar
    const progressPct = ((currentQuestionIndex) / currentQuizQuestions.length) * 100;
    progressBarFill.style.width = `${progressPct}%`;
    activeProgressLabel.textContent = `Question ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;

    // Questions layout
    const q = currentQuizQuestions[currentQuestionIndex];
    questionText.textContent = q.text;

    // Load Option Buttons
    optionsGrid.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-index">${String.fromCharCode(65 + idx)}</span>
        <span>${opt}</span>
      `;
      btn.addEventListener('click', () => handleOptionSelection(idx));
      optionsGrid.appendChild(btn);
    });
  };

  const updateTimerRing = () => {
    const circumference = 2 * Math.PI * 16;
    const strokeDashOffset = (timeLeft / maxTime) * circumference;
    timerProgressRing.style.strokeDashoffset = `${circumference - strokeDashOffset}`;
  };

  const handleOptionSelection = (selectedIdx) => {
    clearInterval(timerInterval);
    const q = currentQuizQuestions[currentQuestionIndex];
    const correctIdx = q.correct;

    const btns = optionsGrid.querySelectorAll('.option-btn');
    // Disable all options
    btns.forEach(b => b.disabled = true);

    if (selectedIdx === correctIdx) {
      correctAnswersCount++;
      btns[selectedIdx].classList.add('correct');
      // Check if answered fast
      if (maxTime - timeLeft <= 15) {
        fastAnswered = true;
      }
    } else {
      btns[selectedIdx].classList.add('incorrect');
      btns[correctIdx].classList.add('correct');
    }

    setTimeout(nextQuestion, 1500);
  };

  const handleTimeOut = () => {
    const q = currentQuizQuestions[currentQuestionIndex];
    const correctIdx = q.correct;
    const btns = optionsGrid.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    // Highlight correct answer
    btns[correctIdx].classList.add('correct');

    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    clearInterval(timerInterval);
    
    // Calculate final scores
    const diff = quizDifficulty.value;
    let pointsPerCorrect = 20; // Medium
    if (diff === 'easy') pointsPerCorrect = 10;
    if (diff === 'hard') pointsPerCorrect = 30;

    const gainedPoints = correctAnswersCount * pointsPerCorrect;
    const accuracy = Math.round((correctAnswersCount / currentQuizQuestions.length) * 100);

    // Update active state
    userProfile.totalScore = (userProfile.totalScore || 0) + gainedPoints;
    
    // Save to history list
    const log = {
      subject: activeCategoryBadge.textContent,
      difficulty: diff,
      score: gainedPoints,
      accuracy: accuracy,
      date: new Date().toISOString().split('T')[0]
    };
    if (!userProfile.history) userProfile.history = [];
    userProfile.history.push(log);

    // Unlock badges check logic
    checkBadgesUnlock(accuracy, gainedPoints);

    // Update database
    const db = getUsersDb();
    db[currentUserEmail] = userProfile;
    saveUsersDb(db);

    // Render Stats
    resultScoreText.textContent = `+${gainedPoints} PTS`;
    resultCorrectCount.textContent = `${correctAnswersCount}/${currentQuizQuestions.length}`;
    resultAccuracy.textContent = `${accuracy}%`;

    // Visual subtitles triggers
    if (accuracy === 100) {
      resultSubtitle.textContent = 'Flawless Victory! You scored 100% accuracy.';
    } else if (accuracy >= 60) {
      resultSubtitle.textContent = 'Well done! A solid performance.';
    } else {
      resultSubtitle.textContent = 'Keep practicing to build your trivia index.';
    }

    // Toggle panels view
    quizResultPanel.classList.remove('hidden');

    // Update sidebar profiles labels immediately
    profilePointsLabel.textContent = `${userProfile.totalScore} PTS`;
  };

  const checkBadgesUnlock = (accuracy, points) => {
    if (!userProfile.unlockedBadges) userProfile.unlockedBadges = [];
    const unlocked = userProfile.unlockedBadges;

    // Badge 1: First Step
    if (!unlocked.includes('badge1')) {
      unlocked.push('badge1');
    }
    // Badge 2: Century Club
    if (userProfile.totalScore >= 100 && !unlocked.includes('badge2')) {
      unlocked.push('badge2');
    }
    // Badge 3: Perfect Score
    if (accuracy === 100 && !unlocked.includes('badge3')) {
      unlocked.push('badge3');
    }
    // Badge 4: Fast Learner
    if (fastAnswered && !unlocked.includes('badge4')) {
      unlocked.push('badge4');
    }
  };

  resultDoneBtn.addEventListener('click', () => {
    quizGameplayView.classList.add('hidden');
    // Refresh lists
    renderLeaderboard();
    renderAchievements();
    renderHistory();
  });

  exitQuizBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      clearInterval(timerInterval);
      quizGameplayView.classList.add('hidden');
    }
  });

  // --- MOCK AI CUSTOM MCQ GENERATOR LOGIC ---

  aiPromptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const promptText = aiTopic.value.trim();
    const diff = aiDifficulty.value;
    const count = parseInt(aiCount.value);

    // Semantic Generator based on keywords input
    const generatedQuestions = generateMockAIQuiz(promptText, diff, count);
    
    // Clear prompt inputs
    aiTopic.value = '';
    
    // Launch quiz session directly with generated array
    startQuiz('Custom AI Quiz', generatedQuestions);
  });

  const generateMockAIQuiz = (topic, diff, count) => {
    const list = [];
    
    // Normalizers
    const key = topic.toLowerCase();
    
    // Semantic mock matching database
    let customSubjectsBank = [
      { q: `What is a primary key in a database schema?`, o: ['A duplicate key entry', 'A unique identifier for each table record', 'A secondary indexing file', 'A decryption password key'], c: 1 },
      { q: `Which language is mostly used to design database scripts?`, o: ['HTML', 'SQL', 'C++', 'Python'], c: 1 },
      { q: `What does SQL stand for?`, o: ['Structured Query Language', 'Simple Query Language', 'Scale Query Language', 'System Query Layout'], c: 0 }
    ];

    if (key.includes('sql') || key.includes('database') || key.includes('query')) {
      customSubjectsBank = [
        { q: `What is the SQL statement used to fetch data?`, o: ['GET', 'SELECT', 'FETCH', 'EXTRACT'], c: 1 },
        { q: `Which join returns all matched records plus all unmatched left records?`, o: ['INNER JOIN', 'RIGHT OUTER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN'], c: 2 },
        { q: `What is a primary key in a database?`, o: ['A duplicate key entry', 'A unique identifier for each table record', 'A secondary indexing file', 'A decryption password key'], c: 1 },
        { q: `Which keyword is used to remove duplicates in SELECT statements?`, o: ['UNIQUE', 'DISTINCT', 'SINGLE', 'DIFFERENT'], c: 1 },
        { q: `What does SQL stand for?`, o: ['Structured Query Language', 'Simple Query Language', 'Scale Query Language', 'System Query Layout'], c: 0 }
      ];
    } else if (key.includes('git') || key.includes('github') || key.includes('version')) {
      customSubjectsBank = [
        { q: `Which Git command initializes a local repository?`, o: ['git start', 'git create', 'git init', 'git setup'], c: 2 },
        { q: `How do you download an existing repository from GitHub locally?`, o: ['git copy', 'git download', 'git pull', 'git clone'], c: 3 },
        { q: `Which command stages all modified files?`, o: ['git stage --all', 'git add .', 'git commit -a', 'git push'], c: 1 },
        { q: `What does "git merge" do?`, o: ['Combines multiple commits together', 'Creates a new branch pointer', 'Merges changes from one branch into another', 'Deletes unstaged commits'], c: 2 },
        { q: `What command lists the commit logs?`, o: ['git log', 'git status', 'git history', 'git show'], c: 0 }
      ];
    } else if (key.includes('docker') || key.includes('kubernetes') || key.includes('container')) {
      customSubjectsBank = [
        { q: `What is a Docker container?`, o: ['A running instance of a Docker image', 'A static file build configuration', 'A virtual machine hypervisor', 'A cloud storage registry'], c: 0 },
        { q: `Which file defines the build configurations for custom Docker images?`, o: ['docker.config', 'Dockerfile', 'compose.yaml', 'Makefile'], c: 1 },
        { q: `In Kubernetes, what is the smallest deployable unit?`, o: ['Node', 'Service', 'Container', 'Pod'], c: 3 },
        { q: `Which command runs container images locally in detached mode?`, o: ['docker run -d', 'docker run -t', 'docker execute', 'docker build'], c: 0 },
        { q: `What tool orchestrates multi-container configurations using YAML declarations?`, o: ['Kubernetes', 'Docker Compose', 'Swarm', 'Vagrant'], c: 1 }
      ];
    } else {
      // General software engineering fallback themed around user's topic
      customSubjectsBank = [
        { q: `What is the core concern of "${topic}"?`, o: ['Software design logic', 'Database storage size', 'Hardware circuit layouts', 'Bandwidth frequencies'], c: 0 },
        { q: `Which design pattern focuses on creating single instances of class structures?`, o: ['Factory', 'Observer', 'Singleton', 'Decorator'], c: 2 },
        { q: `What is the time complexity of looking up keys in hash maps on average?`, o: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'], c: 0 },
        { q: `In programming, what does DRY stand for?`, o: ['Do Repeat Yourself', 'Don\'t Repeat Yourself', 'Database Routing Yields', 'Direct Rendering Yields'], c: 1 },
        { q: `Which methodology focuses on incremental development steps (Sprints)?`, o: ['Waterfall', 'Agile/Scrum', 'V-Model', 'Iterative Spiral'], c: 1 }
      ];
    }

    // Limit to user chosen count
    const limit = Math.min(count, customSubjectsBank.length);
    for (let i = 0; i < limit; i++) {
      const q = customSubjectsBank[i];
      // Map difficulty flag
      q.difficulty = diff;
      list.push(q);
    }
    return list;
  };

  // --- ACCOUNT SETTINGS BINDINGS ---

  changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = newPasswordInput.value;
    if (newPass.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    const db = getUsersDb();
    if (db[currentUserEmail]) {
      db[currentUserEmail].password = newPass;
      saveUsersDb(db);
      newPasswordInput.value = '';
      passwordSuccessMsg.textContent = 'Password updated successfully!';
      setTimeout(() => {
        passwordSuccessMsg.textContent = '';
      }, 3000);
    }
  });

  deleteAccountBtn.addEventListener('click', () => {
    if (confirm('CAUTION: Are you sure you want to delete your account? All score indices, progress history, and milestones will be deleted permanently.')) {
      const db = getUsersDb();
      delete db[currentUserEmail];
      saveUsersDb(db);
      terminateSession();
    }
  });

  // --- Initial check ---
  const activeEmail = getSession();
  if (activeEmail) {
    initSession(activeEmail);
  } else {
    terminateSession();
  }
});
