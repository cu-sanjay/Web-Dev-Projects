// Select necessary DOM elements
const htmlDoc = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');

const searchForm = document.getElementById('searchForm');
const usernameInput = document.getElementById('usernameInput');
const historyRow = document.getElementById('historyRow');
const historyContainer = document.getElementById('historyContainer');

const loadingState = document.getElementById('loadingState');
const errorPanel = document.getElementById('errorPanel');
const errorTitle = document.getElementById('errorTitle');
const errorDesc = document.getElementById('errorDesc');
const profileDashboard = document.getElementById('profileDashboard');

// Theme Switcher Logic
function setTheme(theme) {
  htmlDoc.setAttribute('data-theme', theme);
  localStorage.setItem('gitscope_theme', theme);
  if (theme === 'light') {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

// Initialize Theme
const savedTheme = localStorage.getItem('gitscope_theme') || 'dark';
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = htmlDoc.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Search History Logic
let searchHistory = [];

function loadHistory() {
  try {
    const historyStr = localStorage.getItem('gitscope_search_history');
    searchHistory = historyStr ? JSON.parse(historyStr) : [];
  } catch (e) {
    searchHistory = [];
  }
  renderHistory();
}

function saveHistory(username) {
  // Normalize search history array to unique items
  const existingIndex = searchHistory.findIndex(u => u.toLowerCase() === username.toLowerCase());
  if (existingIndex !== -1) {
    searchHistory.splice(existingIndex, 1);
  }
  searchHistory.unshift(username);
  if (searchHistory.length > 5) {
    searchHistory.pop();
  }
  localStorage.setItem('gitscope_search_history', JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  if (searchHistory.length === 0) {
    historyRow.classList.add('hidden');
    return;
  }
  historyRow.classList.remove('hidden');
  historyContainer.innerHTML = '';
  searchHistory.forEach(username => {
    const tag = document.createElement('span');
    tag.className = 'history-tag';
    tag.textContent = username;
    tag.addEventListener('click', () => {
      usernameInput.value = username;
      performSearch(username);
    });
    historyContainer.appendChild(tag);
  });
}

// UI State Visibility Management
function showLoading() {
  loadingState.classList.remove('hidden');
  errorPanel.classList.add('hidden');
  profileDashboard.classList.add('hidden');
}

function showError(title, desc) {
  loadingState.classList.add('hidden');
  profileDashboard.classList.add('hidden');
  errorPanel.classList.remove('hidden');
  errorTitle.textContent = title;
  errorDesc.textContent = desc;
}

function showDashboard() {
  loadingState.classList.add('hidden');
  errorPanel.classList.add('hidden');
  profileDashboard.classList.remove('hidden');
}

// Date Formatting Helper
function formatJoinedDate(isoString) {
  if (!isoString) return '';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(isoString);
  const day = date.getUTCDate();
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `Joined ${month} ${day < 10 ? '0' + day : day}, ${year}`;
}

// Language Color Mapping
function getLanguageColor(language) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    PHP: '#4F5D95',
    Shell: '#89e051'
  };
  return colors[language] || '#8d8a9e';
}

// Update Meta Row Helper
function updateMetaRow(rowId, textId, value) {
  const row = document.getElementById(rowId);
  const textSpan = document.getElementById(textId);
  if (value) {
    row.classList.remove('hidden');
    textSpan.textContent = value;
  } else {
    row.classList.add('hidden');
  }
}

// Populate UI Profile Data
function populateProfile(data) {
  document.getElementById('avatarImg').src = data.avatar_url || '';
  document.getElementById('profileName').textContent = data.name || data.login;
  
  const profileLogin = document.getElementById('profileLogin');
  profileLogin.textContent = `@${data.login}`;
  profileLogin.href = data.html_url;

  document.getElementById('profileBio').textContent = data.bio || 'This profile has no bio';

  updateMetaRow('metaLocationRow', 'metaLocation', data.location);
  updateMetaRow('metaCompanyRow', 'metaCompany', data.company);
  
  const blogRow = document.getElementById('metaBlogRow');
  const blogLink = document.getElementById('metaBlog');
  if (data.blog) {
    blogRow.classList.remove('hidden');
    blogLink.textContent = data.blog.replace(/https?:\/\/(www\.)?/, '');
    blogLink.href = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
  } else {
    blogRow.classList.add('hidden');
  }

  const twitterRow = document.getElementById('metaTwitterRow');
  const twitterLink = document.getElementById('metaTwitter');
  if (data.twitter_username) {
    twitterRow.classList.remove('hidden');
    twitterLink.textContent = `@${data.twitter_username}`;
    twitterLink.href = `https://twitter.com/${data.twitter_username}`;
  } else {
    twitterRow.classList.add('hidden');
  }

  document.getElementById('metaJoined').textContent = formatJoinedDate(data.created_at);

  // Stats Counters
  document.getElementById('statRepos').textContent = data.public_repos ?? 0;
  document.getElementById('statGists').textContent = data.public_gists ?? 0;
  document.getElementById('statFollowers').textContent = data.followers ?? 0;
  document.getElementById('statFollowing').textContent = data.following ?? 0;
}

// Populate UI Repository Grid Data
function populateRepos(repos) {
  const reposGrid = document.getElementById('reposGrid');
  reposGrid.innerHTML = '';

  if (!repos || repos.length === 0) {
    reposGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 24px;">No public repositories available.</div>';
    return;
  }

  repos.forEach(repo => {
    const card = document.createElement('article');
    card.className = 'repo-card card';
    
    const langSection = repo.language ? `
      <span class="repo-lang-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
      <span>${repo.language}</span>
    ` : '';

    card.innerHTML = `
      <div class="repo-card-title">
        <h4><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h4>
      </div>
      <p class="repo-desc">${repo.description || 'No description provided.'}</p>
      <div class="repo-meta">
        <div class="repo-left-meta">
          ${langSection}
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span class="repo-stars" title="Stars">⭐ ${repo.stargazers_count}</span>
          <span title="Forks">🍴 ${repo.forks_count}</span>
        </div>
      </div>
    `;
    reposGrid.appendChild(card);
  });
}

// Fetch Profile and Repo Info asynchronously
async function performSearch(username) {
  if (!username || username.trim() === '') return;
  const trimmedUsername = username.trim();
  showLoading();

  try {
    const userResponse = await fetch(`https://api.github.com/users/${trimmedUsername}`);
    
    if (userResponse.status === 404) {
      showError('User Not Found', 'Please check the spelling and try again.');
      return;
    }
    if (userResponse.status === 403) {
      showError('API Rate Limit Exceeded', 'GitHub API rate limit has been exceeded. Please try again later or wait for it to reset.');
      return;
    }
    if (!userResponse.ok) {
      showError('API Connection Error', `Unable to fetch user data (Error: ${userResponse.status}).`);
      return;
    }

    const userData = await userResponse.json();

    // Fetch top 5 recent repositories
    let reposData = [];
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${trimmedUsername}/repos?sort=updated&per_page=5`);
      if (reposResponse.ok) {
        reposData = await reposResponse.json();
      }
    } catch (repoErr) {
      console.error('Failed to fetch repositories', repoErr);
    }

    populateProfile(userData);
    populateRepos(reposData);
    saveHistory(trimmedUsername);
    showDashboard();
  } catch (err) {
    console.error(err);
    showError('Network Error', 'A connection error occurred. Please verify your network connection.');
  }
}

// Bind search submission event
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  performSearch(usernameInput.value);
});

// Load saved history on startup
loadHistory();
