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

// Pagination State
let allRepos = [];
let currentPage = 1;
const reposPerPage = 6;

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');

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
  // Refresh graphs if dashboard is visible to match current theme
  updateGraphThemes(theme);
}

// Initialize Theme
const savedTheme = localStorage.getItem('gitscope_theme') || 'dark';
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = htmlDoc.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Update dynamic activity graphs to match light/dark settings with orange theme colors
function updateGraphThemes(theme) {
  const username = usernameInput.value.trim();
  if (!username) return;
  
  let heatmapImg = document.getElementById('contributionHeatmap');
  let lineGraphImg = document.getElementById('activityLineGraph');
  
  // Recreate heatmap image if missing
  if (!heatmapImg) {
    const container = document.querySelector('.heatmap-img-container');
    if (container) {
      container.innerHTML = '<img id="contributionHeatmap" alt="Contribution Heatmap Chart">';
      heatmapImg = document.getElementById('contributionHeatmap');
    }
  }
  
  if (heatmapImg) {
    heatmapImg.onerror = () => {
      const container = document.querySelector('.heatmap-img-container');
      if (container) container.innerHTML = '<p class="no-data-msg">Contribution graph unavailable</p>';
    };
    // Render chart with orange theme color (ea580c)
    heatmapImg.src = `https://ghchart.rshah.org/ea580c/${username}`;
  }
  
  // Recreate line graph image if missing
  if (!lineGraphImg) {
    const container = document.querySelector('.trend-img-container');
    if (container) {
      container.innerHTML = '<img id="activityLineGraph" alt="Weekly Activity Trend">';
      lineGraphImg = document.getElementById('activityLineGraph');
    }
  }
  
  if (lineGraphImg) {
    lineGraphImg.onerror = () => {
      const container = document.querySelector('.trend-img-container');
      if (container) container.innerHTML = '<p class="no-data-msg">Activity graph unavailable</p>';
    };
    lineGraphImg.src = theme === 'light'
      ? `https://github-readme-activity-graph.vercel.app/graph?username=${username}&bg_color=ffffff&color=ea580c&line=c2410c&point=09090b&area=true&hide_border=true`
      : `https://github-readme-activity-graph.vercel.app/graph?username=${username}&bg_color=18181b&color=ff7b00&line=ea580c&point=fafafa&area=true&hide_border=true`;
  }
}

// Tabbed Dashboard Pane Switcher
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
  });
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

// Language Color Mapping (Orange and neutral theme variations)
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
  return colors[language] || '#71717a';
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

// Reset tabs back to "Overview" on search
function resetTabs() {
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabPanes.forEach(pane => pane.classList.remove('active'));
  
  tabButtons[0].classList.add('active');
  tabPanes[0].classList.add('active');
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

// Calculate and render primary language distribution
function populateLanguages(repos) {
  const container = document.getElementById('languagesContainer');
  container.innerHTML = '';
  
  if (!repos || repos.length === 0) {
    container.innerHTML = '<p class="no-data-msg">No repository language data available.</p>';
    return;
  }
  
  const languageCounts = {};
  let totalValidRepos = 0;
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      totalValidRepos++;
    }
  });
  
  if (totalValidRepos === 0) {
    container.innerHTML = '<p class="no-data-msg">No language metrics reported.</p>';
    return;
  }
  
  const sortedLangs = Object.keys(languageCounts).map(lang => ({
    name: lang,
    count: languageCounts[lang],
    percentage: Math.round((languageCounts[lang] / totalValidRepos) * 100)
  })).sort((a, b) => b.count - a.count);
  
  sortedLangs.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'language-item';
    const color = getLanguageColor(lang.name);
    
    item.innerHTML = `
      <div class="language-header">
        <div class="language-name-dot">
          <span class="repo-lang-dot" style="background-color: ${color}"></span>
          <span>${lang.name}</span>
        </div>
        <span>${lang.percentage}%</span>
      </div>
      <div class="language-bar">
        <div class="language-progress" style="width: ${lang.percentage}%; background-color: ${color}"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Compute dynamic achievements based on user parameters
function populateAchievements(profileData, repos) {
  const container = document.getElementById('achievementsContainer');
  container.innerHTML = '';
  
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const joinYear = new Date(profileData.created_at).getUTCFullYear();
  
  const badges = [
    {
      id: 'early_adopter',
      icon: '🚀',
      title: 'Early Adopter',
      desc: 'Joined before 2015',
      unlocked: joinYear < 2015
    },
    {
      id: 'pro_coder',
      icon: '🏆',
      title: 'Pro Coder',
      desc: 'Over 50 repositories',
      unlocked: (profileData.public_repos || 0) >= 50
    },
    {
      id: 'star_magnet',
      icon: '⭐',
      title: 'Star Magnet',
      desc: 'Top repos stars > 50',
      unlocked: totalStars >= 50
    },
    {
      id: 'community_leader',
      icon: '👥',
      title: 'Influencer',
      desc: 'Over 100 followers',
      unlocked: (profileData.followers || 0) >= 100
    },
    {
      id: 'gist_creator',
      icon: '💡',
      title: 'Gist Master',
      desc: 'Over 5 public gists',
      unlocked: (profileData.public_gists || 0) >= 5
    }
  ];
  
  badges.forEach(badge => {
    const badgeEl = document.createElement('div');
    badgeEl.className = `achievement-badge ${badge.unlocked ? '' : 'locked'}`;
    badgeEl.title = badge.unlocked ? 'Achievement Unlocked!' : 'Locked';
    
    badgeEl.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <span class="badge-title">${badge.title}</span>
      <span class="badge-desc">${badge.desc}</span>
    `;
    container.appendChild(badgeEl);
  });
}

// Populate repositories grids and handle local pagination logic
function populateRepos(repos) {
  const pinnedReposGrid = document.getElementById('pinnedReposGrid');
  pinnedReposGrid.innerHTML = '';
  
  if (!repos || repos.length === 0) {
    const emptyMarkup = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 24px;">No repositories available.</div>';
    pinnedReposGrid.innerHTML = emptyMarkup;
    return;
  }
  
  // Sort repos by stars to get "Pinned / Top Starred" (Max 4 items)
  const topStarred = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 4);
  
  const makeCard = (repo) => {
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
    return card;
  };
  
  topStarred.forEach(repo => pinnedReposGrid.appendChild(makeCard(repo)));
}

// Renders the current active page for all repositories grid
function renderPaginatedRepos() {
  const reposGrid = document.getElementById('reposGrid');
  reposGrid.innerHTML = '';
  
  if (!allRepos || allRepos.length === 0) {
    reposGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 24px;">No repositories available.</div>';
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    pageIndicator.textContent = 'Page 1 of 1';
    return;
  }
  
  const sortedRepos = [...allRepos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  const totalPages = Math.ceil(sortedRepos.length / reposPerPage);
  
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const startIndex = (currentPage - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;
  const paginatedRepos = sortedRepos.slice(startIndex, endIndex);
  
  const makeCard = (repo) => {
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
    return card;
  };
  
  paginatedRepos.forEach(repo => reposGrid.appendChild(makeCard(repo)));
  
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// Bind pagination navigation listeners
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPaginatedRepos();
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.ceil(allRepos.length / reposPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPaginatedRepos();
  }
});

// Fetch Profile README (.github or special username profile repo README)
async function fetchProfileReadme(username) {
  const readmeSection = document.getElementById('readmeSection');
  const readmeContent = document.getElementById('readmeContent');
  
  readmeSection.classList.add('hidden');
  readmeContent.innerHTML = '';
  
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
      headers: { 'Accept': 'application/vnd.github.raw' }
    });
    
    if (response.ok) {
      const markdownText = await response.text();
      if (markdownText && typeof marked !== 'undefined') {
        readmeContent.innerHTML = marked.parse(markdownText);
        readmeSection.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Error loading profile README:', err);
  }
}

// Parse recent activity timeline logs
async function fetchRecentActivity(username) {
  const timelineContainer = document.getElementById('activityTimeline');
  timelineContainer.innerHTML = '';
  
  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`);
    if (!response.ok) {
      timelineContainer.innerHTML = '<p class="no-data-msg">Unable to load event logs.</p>';
      return;
    }
    
    const events = await response.json();
    const cleanEvents = events.slice(0, 10);
    
    if (cleanEvents.length === 0) {
      timelineContainer.innerHTML = '<p class="no-data-msg">No recent activity events registered.</p>';
      return;
    }
    
    cleanEvents.forEach(event => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      
      let description = '';
      const repoUrl = `https://github.com/${event.repo.name}`;
      const repoLink = `<a href="${repoUrl}" target="_blank" rel="noopener">${event.repo.name}</a>`;
      
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload.commits ? event.payload.commits.length : 1;
          description = `Pushed ${commitCount} commit(s) to branch <code>${event.payload.ref.replace('refs/heads/', '')}</code> in ${repoLink}`;
          break;
        case 'CreateEvent':
          description = `Created <code>${event.payload.ref_type}</code> ${event.payload.ref || ''} in ${repoLink}`;
          break;
        case 'WatchEvent':
          description = `Starred repository ${repoLink}`;
          break;
        case 'ForkEvent':
          description = `Forked repository ${repoLink}`;
          break;
        case 'IssuesEvent':
          const issueNum = event.payload.issue ? `#${event.payload.issue.number}` : '';
          description = `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} issue ${issueNum} in ${repoLink}`;
          break;
        case 'PullRequestEvent':
          const prNum = event.payload.number ? `#${event.payload.number}` : '';
          description = `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} pull request ${prNum} in ${repoLink}`;
          break;
        default:
          description = `${event.type.replace('Event', '')} interaction in ${repoLink}`;
          break;
      }
      
      const dateOptions = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      const eventDate = new Date(event.created_at).toLocaleDateString('en-US', dateOptions);
      
      item.innerHTML = `
        <span class="timeline-dot"></span>
        <div class="timeline-content">
          <span class="timeline-title">${description}</span>
          <span class="timeline-date">${eventDate}</span>
        </div>
      `;
      timelineContainer.appendChild(item);
    });
  } catch (err) {
    console.error('Error fetching activity timeline:', err);
    timelineContainer.innerHTML = '<p class="no-data-msg">Network error loading activity logs.</p>';
  }
}

// Fetch Profile and Repo Info asynchronously
async function performSearch(username) {
  if (!username || username.trim() === '') return;
  const trimmedUsername = username.trim();
  showLoading();
  resetTabs();

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

    // Fetch repositories
    let reposData = [];
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${trimmedUsername}/repos?per_page=100`);
      if (reposResponse.ok) {
        reposData = await reposResponse.json();
      }
    } catch (repoErr) {
      console.error('Failed to fetch repositories', repoErr);
    }

    allRepos = reposData;
    currentPage = 1;

    // Populate dashboard fields
    populateProfile(userData);
    populateLanguages(reposData);
    populateAchievements(userData, reposData);
    populateRepos(reposData);
    renderPaginatedRepos();
    
    // Update Theme Graphs & fetch timeline data
    updateGraphThemes(htmlDoc.getAttribute('data-theme'));
    fetchProfileReadme(trimmedUsername);
    fetchRecentActivity(trimmedUsername);
    
    // Save history search log
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
