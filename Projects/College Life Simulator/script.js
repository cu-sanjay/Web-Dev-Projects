// --- Auth & Session Logic ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

document.getElementById('go-to-register').addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

function handleAuth(e, type) {
  e.preventDefault();
  
  let name = "Student";
  let email = "";

  if (type === 'login') {
    email = document.getElementById('login-email').value;
  } else {
    name = document.getElementById('reg-name').value;
    email = document.getElementById('reg-email').value;
  }

  // Mock setting user session
  localStorage.setItem('collegeUser', JSON.stringify({ name, email }));
  
  initApp();
}

loginForm.addEventListener('submit', (e) => handleAuth(e, 'login'));
registerForm.addEventListener('submit', (e) => handleAuth(e, 'register'));

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('collegeUser');
  appScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  loginForm.reset();
  registerForm.reset();
});


// --- Navigation Logic ---
const navLinks = document.querySelectorAll('.nav-links li');
const appSections = document.querySelectorAll('.app-section');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Update Active Nav Link
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Show correct section
    const targetId = link.getAttribute('data-target');
    appSections.forEach(sec => {
      sec.classList.remove('active-section');
      if (sec.id === targetId) {
        sec.classList.add('active-section');
      }
    });

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  });
});

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});


// --- Profile Initialization ---
function initApp() {
  const user = JSON.parse(localStorage.getItem('collegeUser'));
  if (!user) {
    appScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    return;
  }

  // Hide Auth, Show App
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  // Populate User Info
  document.getElementById('topbar-user-name').textContent = user.name || user.email.split('@')[0];
  document.getElementById('profile-name').textContent = user.name || user.email.split('@')[0];
  document.getElementById('profile-email').textContent = user.email;
  
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random`;
  document.getElementById('topbar-avatar').src = avatarUrl;
  document.getElementById('profile-avatar').src = avatarUrl + "&size=128";

  // Init game if not started
  startGame();
}


// --- Simulator Game Logic ---
let stats = { academics: 50, social: 50, health: 50 };
let currentWeek = 1;
const MAX_WEEKS = 15;

const barAcademics = document.getElementById('bar-academics');
const barSocial = document.getElementById('bar-social');
const barHealth = document.getElementById('bar-health');
const weekDisplay = document.getElementById('week-display');

const eventTitle = document.getElementById('event-title');
const eventDesc = document.getElementById('event-desc');
const choicesBox = document.getElementById('choices-box');

const gameOverScreen = document.getElementById('game-over-screen');
const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const restartBtn = document.getElementById('restart-btn');

const gameEvents = [
  {
    title: "Midterm Season",
    desc: "Exams are piling up. What's your strategy?",
    choices: [
      { text: "Pull an all-nighter studying", effects: { academics: 20, health: -15, social: -5 } },
      { text: "Study a bit, sleep well", effects: { academics: 5, health: 5, social: -5 } },
      { text: "Go to a party instead", effects: { academics: -20, social: 15, health: -5 } }
    ]
  },
  {
    title: "Campus Flu",
    desc: "A nasty bug is going around your dorm.",
    choices: [
      { text: "Rest in bed all weekend", effects: { health: 15, academics: -10, social: -10 } },
      { text: "Power through and go to class", effects: { health: -20, academics: 10, social: -5 } }
    ]
  },
  {
    title: "Weekend Plans",
    desc: "Your friends are going on a road trip. You have a paper due Monday.",
    choices: [
      { text: "Go on the trip! YOLO", effects: { social: 25, academics: -20, health: -5 } },
      { text: "Stay back and write the paper", effects: { academics: 15, social: -15, health: 5 } }
    ]
  },
  {
    title: "Gym Time",
    desc: "You feel sluggish. A friend invites you to work out.",
    choices: [
      { text: "Hit the gym hard", effects: { health: 20, social: 5, academics: -10 } },
      { text: "Nah, order pizza and study", effects: { health: -15, academics: 15, social: 5 } }
    ]
  }
];

function updateUI() {
  for (let key in stats) {
    if (stats[key] > 100) stats[key] = 100;
    if (stats[key] < 0) stats[key] = 0;
  }

  barAcademics.style.width = `${stats.academics}%`;
  barSocial.style.width = `${stats.social}%`;
  barHealth.style.width = `${stats.health}%`;
  
  barAcademics.style.backgroundColor = stats.academics < 20 ? 'red' : 'var(--academics)';
  barSocial.style.backgroundColor = stats.social < 20 ? 'red' : 'var(--social)';
  barHealth.style.backgroundColor = stats.health < 20 ? 'red' : 'var(--health)';

  weekDisplay.textContent = currentWeek;
}

function checkGameOver() {
  if (stats.academics <= 0) {
    endGame("Academic Probation", "You failed your classes and got kicked out.");
    return true;
  }
  if (stats.social <= 0) {
    endGame("Total Isolation", "You became completely burnt out and isolated.");
    return true;
  }
  if (stats.health <= 0) {
    endGame("Hospitalized", "You completely neglected your health and ended up in the hospital.");
    return true;
  }
  
  if (currentWeek > MAX_WEEKS) {
    endGame("You Survived!", "Congratulations! You made it to the end of the semester.", true);
    return true;
  }
  return false;
}

function endGame(title, message, isWin = false) {
  gameOverScreen.classList.remove('hidden');
  endTitle.textContent = title;
  endTitle.style.color = isWin ? 'var(--health)' : 'red';
  endMessage.textContent = message;
}

function handleChoice(effects) {
  stats.academics += effects.academics || 0;
  stats.social += effects.social || 0;
  stats.health += effects.health || 0;
  
  currentWeek++;
  updateUI();
  
  if (!checkGameOver()) {
    loadNextEvent();
  }
}

function loadNextEvent() {
  const ev = gameEvents[Math.floor(Math.random() * gameEvents.length)];
  eventTitle.textContent = ev.title;
  eventDesc.textContent = ev.desc;
  
  choicesBox.innerHTML = '';
  ev.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = choice.text;
    btn.onclick = () => handleChoice(choice.effects);
    choicesBox.appendChild(btn);
  });
}

function startGame() {
  stats = { academics: 50, social: 50, health: 50 };
  currentWeek = 1;
  gameOverScreen.classList.add('hidden');
  updateUI();
  
  eventTitle.textContent = "Welcome to College!";
  eventDesc.textContent = "It's your first day. How do you want to kick off the semester?";
  
  choicesBox.innerHTML = '';
  const firstChoices = [
    { text: "Hit the library early", effects: { academics: 15, social: -5, health: 0 } },
    { text: "Go to the freshman mixer", effects: { social: 15, academics: -5, health: -5 } },
    { text: "Sleep in and unpack slowly", effects: { health: 15, social: -5, academics: -5 } }
  ];
  
  firstChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = choice.text;
    btn.onclick = () => handleChoice(choice.effects);
    choicesBox.appendChild(btn);
  });
}

restartBtn.addEventListener('click', startGame);

// Check Session on Load
if (localStorage.getItem('collegeUser')) {
  initApp();
}
