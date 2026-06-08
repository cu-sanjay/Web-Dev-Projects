// Showcase page bootstrap. Reads projects.json and renders the grid.

const grid = document.getElementById("grid");
const tpl = document.getElementById("card-template");
const search = document.getElementById("search");
const shuffleBtn = document.getElementById("shuffle-btn");
const themeToggle = document.getElementById("theme-toggle");
const sortSelect = document.getElementById("sort-select");
const tagbar = document.getElementById("tagbar");
const empty = document.getElementById("empty");
const topnavLinks = Array.from(document.querySelectorAll('.topnav a[href^="#"]'));
const pageSections = Array.from(document.querySelectorAll('main section[id]'));

const statCount = document.getElementById("stat-count");
const statUpdated = document.getElementById("stat-updated");

const tagModalOverlay = document.getElementById("tag-modal-overlay");
const tagModalCloseBtn = document.getElementById("tag-modal-close");
const tagModalSearchInput = document.getElementById("tag-modal-search");
const tagModalCloud = document.getElementById("tag-modal-cloud");

const state = { all: [], filtered: [], activeTag: null, query: "", sortBy: "default", onlyBookmarks: false };

/* ── GitHub Profile Cache ───────────────────────── */
const ghProfileCache = new Map();

function getCachedProfile(username) {
  const key = `gh_profile_${username}`;
  // Check in-memory cache first
  if (ghProfileCache.has(username)) return ghProfileCache.get(username);
  // Check localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Cache for 1 hour
      if (Date.now() - parsed._ts < 3600000) {
        ghProfileCache.set(username, parsed);
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return null;
}

function setCachedProfile(username, data) {
  data._ts = Date.now();
  ghProfileCache.set(username, data);
  try {
    localStorage.setItem(`gh_profile_${username}`, JSON.stringify(data));
  } catch { /* storage full – ignore */ }
}

/* ── Hover Card State ───────────────────────────── */
let hoverTimeout = null;
let activeHoverCard = null;

function getLocalContributions(githubUsername) {
  return state.all.filter(p => p.author && p.author.github && p.author.github.toLowerCase() === githubUsername.toLowerCase());
}

async function fetchGitHubProfile(username) {
  const cached = getCachedProfile(username);
  if (cached) return cached;
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) return null;
    const data = await res.json();
    const profile = {
      name: data.name || username,
      login: data.login,
      avatar_url: data.avatar_url,
      bio: data.bio || "",
      location: data.location || "",
      public_repos: data.public_repos || 0,
      followers: data.followers || 0,
      html_url: data.html_url,
    };
    setCachedProfile(username, profile);
    return profile;
  } catch {
    return null;
  }
}

function createHoverCard(profile, localProjects, githubUsername) {
  const card = document.createElement("div");
  card.className = "hover-card";

  const localList = localProjects.slice(0, 4).map(p =>
    `<li class="hover-card__project">${p.title}</li>`
  ).join("");
  const moreCount = localProjects.length > 4 ? `<li class="hover-card__project hover-card__more">+${localProjects.length - 4} more</li>` : "";

  card.innerHTML = `
    <div class="hover-card__header">
      <img class="hover-card__avatar" src="${profile.avatar_url}" alt="${profile.name}" width="48" height="48" />
      <div class="hover-card__identity">
        <strong class="hover-card__name">${profile.name}</strong>
        <span class="hover-card__login">@${profile.login}</span>
      </div>
    </div>
    ${profile.bio ? `<p class="hover-card__bio">${profile.bio}</p>` : ""}
    ${profile.location ? `<p class="hover-card__location"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${profile.location}</p>` : ""}
    <div class="hover-card__stats">
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${profile.public_repos}</span>
        <span class="hover-card__stat-label">Repos</span>
      </div>
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${profile.followers}</span>
        <span class="hover-card__stat-label">Followers</span>
      </div>
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${localProjects.length}</span>
        <span class="hover-card__stat-label">Here</span>
      </div>
    </div>
    ${localProjects.length > 0 ? `
      <div class="hover-card__contributions">
        <span class="hover-card__contrib-label">Projects in this showcase</span>
        <ul class="hover-card__project-list">${localList}${moreCount}</ul>
      </div>
    ` : ""}
    <div class="hover-card__actions">
      <a class="btn btn--ghost btn--sm hover-card__gh-link" href="${profile.html_url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 .3a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58v-2.16c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 00-1.33-1.76c-1.09-.74.08-.73.08-.73a2.52 2.52 0 011.84 1.24 2.56 2.56 0 003.5 1 2.56 2.56 0 01.76-1.6c-2.67-.3-5.47-1.33-5.47-5.93a4.64 4.64 0 011.24-3.22 4.3 4.3 0 01.12-3.18s1-.32 3.3 1.23a11.38 11.38 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23a4.3 4.3 0 01.12 3.18 4.64 4.64 0 011.24 3.22c0 4.61-2.81 5.63-5.48 5.92a2.87 2.87 0 01.82 2.23v3.29c0 .32.21.7.82.58A12 12 0 0012 .3z"/></svg>
        View Profile
      </a>
      <button class="btn btn--primary btn--sm hover-card__filter-btn" type="button" data-github="${githubUsername}">Show All Projects</button>
    </div>
  `;

  // "Show All Projects" button
  card.querySelector(".hover-card__filter-btn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const gh = e.currentTarget.dataset.github;
    state.authorFilter = gh;
    state.activeTag = null;
    state.query = "";
    search.value = "";
    renderTagbar();
    render();
    dismissHoverCard();
    // Scroll to grid
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  return card;
}

function positionHoverCard(card, anchorEl) {
  document.body.appendChild(card);
  const anchorRect = anchorEl.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  let top = anchorRect.bottom + 8 + window.scrollY;
  let left = anchorRect.left + (anchorRect.width / 2) - (cardRect.width / 2) + window.scrollX;

  // Keep within viewport horizontally
  if (left < 8) left = 8;
  if (left + cardRect.width > window.innerWidth - 8) left = window.innerWidth - cardRect.width - 8;

  // If card would overflow below the viewport, show above
  if (anchorRect.bottom + 8 + cardRect.height > window.innerHeight) {
    top = anchorRect.top - cardRect.height - 8 + window.scrollY;
  }

  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
}

function dismissHoverCard() {
  if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
  if (activeHoverCard) {
    activeHoverCard.classList.remove("is-visible");
    const el = activeHoverCard;
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    activeHoverCard = null;
  }
}

function showHoverCard(anchorEl, githubUsername) {
  dismissHoverCard();
  hoverTimeout = setTimeout(async () => {
    const localProjects = getLocalContributions(githubUsername);
    const fetchedProfile = await fetchGitHubProfile(githubUsername);
    const profile = fetchedProfile || {
      name: anchorEl.textContent.replace(/^by\s+/i, "").trim(),
      login: githubUsername,
      avatar_url: `https://github.com/${githubUsername}.png`,
      bio: "GitHub profile details currently unavailable (rate limited or offline).",
      location: "",
      public_repos: "—",
      followers: "—",
      html_url: `https://github.com/${githubUsername}`
    };
    const card = createHoverCard(profile, localProjects, githubUsername);
    activeHoverCard = card;
    positionHoverCard(card, anchorEl);

    // Allow hover card to stay when mousing into it
    card.addEventListener("mouseenter", () => {
      if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
    });
    card.addEventListener("mouseleave", () => {
      dismissHoverCard();
    });

    requestAnimationFrame(() => card.classList.add("is-visible"));
  }, 300); // 300ms debounce
}

/* ── Bookmark / Favorite State Helpers ────────────────── */
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem("bookmarked_projects")) || [];
  } catch {
    return [];
  }
}

function toggleBookmark(slug) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx > -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(slug);
  }
  localStorage.setItem("bookmarked_projects", JSON.stringify(bookmarks));
  return bookmarks;
}

const PALETTES = [
  ["#efe1cf", "#b86a2b"],
  ["#e5ded0", "#1c1c1e"],
  ["#dfe7df", "#2e6b3e"],
  ["#ece4d8", "#7a4a1c"],
  ["#e9e5dc", "#3a3a3c"],
  ["#f0e6d2", "#a8541b"],
];

function paletteFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

function initialsOf(title) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function placeholderThumb(project) {
  const [bg, ink] = paletteFor(project.slug);
  const text = initialsOf(project.title);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="${bg}"/>
  <g fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="1">
    <path d="M0 150 L320 60"/>
    <path d="M0 170 L320 80"/>
    <path d="M0 190 L320 100"/>
  </g>
  <text x="50%" y="54%" text-anchor="middle" font-family="-apple-system, SF Pro Display, Inter, sans-serif" font-weight="700" font-size="68" fill="${ink}" letter-spacing="-2">${text}</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ── Render ──────────────────────────────────────── */

function render() {
  const q = state.query.trim().toLowerCase();
  const bookmarks = getBookmarks();
  const list = state.all.filter((p) => {
    if (state.onlyBookmarks && !bookmarks.includes(p.slug)) return false;
    if (state.authorFilter) {
      return p.author && p.author.github && p.author.github.toLowerCase() === state.authorFilter.toLowerCase();
    }
    if (state.activeTag && !p.tags.includes(state.activeTag)) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.author?.name || "").toLowerCase().includes(q) ||
      (p.author?.github || "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  state.filtered = list;
  if (state.sortBy === "newest") {
    list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  } else if (state.sortBy === "oldest") {
    list.sort((a, b) => new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
  } else if (state.sortBy === "alpha") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  grid.replaceChildren();
  if (!list.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const p of list) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.slug = p.slug;
    const bookmarkBtn = node.querySelector(".card__bookmark-btn");
    const media = node.querySelector(".card__media");
    const thumb = node.querySelector(".card__thumb");
    const title = node.querySelector(".card__title");
    const desc = node.querySelector(".card__desc");
    const tags = node.querySelector(".card__tags");
    const author = node.querySelector(".card__author");
    const open = node.querySelector(".card__open");
    const source = node.querySelector(".card__source");
    const previewBtn = node.querySelector(".card__preview");

    if (bookmarks.includes(p.slug)) {
      bookmarkBtn.classList.add("is-bookmarked");
    }

    bookmarkBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleBookmark(p.slug);
      bookmarkBtn.classList.toggle("is-bookmarked");
      if (state.onlyBookmarks) {
        render();
      }
    });

    media.href = p.entry;
    thumb.style.backgroundImage = `url("${p.thumbnail || placeholderThumb(p)}")`;
    title.textContent = p.title;
    desc.textContent = p.description;
    for (const t of p.tags) {
      const li = document.createElement("li");
      li.textContent = t;
      tags.appendChild(li);
    }
    if (p.author) {
      author.textContent = "by " + p.author.name;
      author.href = `https://github.com/${p.author.github}`;
      author.dataset.github = p.author.github;

      // Hover card events
      author.addEventListener("mouseenter", (e) => {
        e.preventDefault();
        showHoverCard(author, p.author.github);
      });
      author.addEventListener("mouseleave", () => {
        hoverTimeout = setTimeout(() => dismissHoverCard(), 200);
      });
    } else {
      author.remove();
    }
    open.href = p.entry;
    source.href = `https://github.com/cu-sanjay/Web-Dev-Projects/tree/main/${p.folder}`;
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        openPreviewDrawer(p);
      });
    }
    grid.appendChild(node);
  }
}

function renderTagbar() {
  const counts = new Map();
  for (const p of state.all) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  tagbar.replaceChildren();
  // "All" button (clears active tag, author filter, and bookmark filter)
  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "All";
  all.setAttribute("aria-pressed", state.activeTag === null && !state.authorFilter && !state.onlyBookmarks);
  all.addEventListener("click", () => {
    state.activeTag = null;
    state.authorFilter = null;
    state.onlyBookmarks = false;
    renderTagbar();
    render();
  });
  tagbar.appendChild(all);

  // Show active author filter chip
  if (state.authorFilter) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "author-filter-chip";
    chip.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${state.authorFilter} <span class="chip-close">&times;</span>`;
    chip.setAttribute("aria-pressed", "true");
    chip.addEventListener("click", () => {
      state.authorFilter = null;
      renderTagbar();
      render();
    });
    tagbar.appendChild(chip);
  }

  // Favorites button
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="12" height="12" fill="${state.onlyBookmarks ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>Favorites
  `;
  favBtn.setAttribute("aria-pressed", state.onlyBookmarks);
  favBtn.addEventListener("click", () => {
    state.onlyBookmarks = !state.onlyBookmarks;
    state.authorFilter = null; // Clear author filter when viewing favorites
    state.activeTag = null; // Clear active tag when viewing favorites
    renderTagbar();
    render();
  });
  tagbar.appendChild(favBtn);

  for (const [tag] of tags) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = tag;
    b.setAttribute("aria-pressed", state.activeTag === tag);
    b.addEventListener("click", () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      state.authorFilter = null;
      renderTagbar();
      render();
    });
    tagbar.appendChild(b);
  }

  // Explore All Tags button
  const exploreBtn = document.createElement("button");
  exploreBtn.type = "button";
  exploreBtn.className = "btn-explore-tags";
  exploreBtn.innerHTML = `Explore All Tags <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  exploreBtn.addEventListener("click", () => {
    openTagModal();
  });
  tagbar.appendChild(exploreBtn);
}

function openTagModal() {
  tagModalSearchInput.value = "";
  renderTagCloud("");
  tagModalOverlay.classList.add("is-open");
  tagModalSearchInput.focus();
}

function closeTagModal() {
  tagModalOverlay.classList.remove("is-open");
}

if (tagModalCloseBtn) {
  tagModalCloseBtn.addEventListener("click", closeTagModal);
}

if (tagModalOverlay) {
  tagModalOverlay.addEventListener("click", (e) => {
    if (e.target === tagModalOverlay) closeTagModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && tagModalOverlay && tagModalOverlay.classList.contains("is-open")) {
    closeTagModal();
  }
});

if (tagModalSearchInput) {
  tagModalSearchInput.addEventListener("input", (e) => {
    renderTagCloud(e.target.value);
  });
}

function renderTagCloud(query) {
  const counts = new Map();
  for (const p of state.all) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  
  let allTags = [...counts.entries()];
  
  if (query) {
    const q = query.trim().toLowerCase();
    allTags = allTags.filter(([tag]) => tag.toLowerCase().includes(q));
  }
  
  if (allTags.length === 0) {
    tagModalCloud.innerHTML = '<p style="color: var(--muted); padding: 1rem;">No tags found.</p>';
    return;
  }

  const countsArr = allTags.map(t => t[1]);
  const minCount = Math.min(...countsArr);
  const maxCount = Math.max(...countsArr);
  
  tagModalCloud.replaceChildren();
  allTags.sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [tag, count] of allTags) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-cloud-item";
    btn.textContent = `${tag} (${count})`;
    
    let size = 0.85;
    if (maxCount > minCount) {
      size = 0.85 + ((count - minCount) / (maxCount - minCount)) * 0.75;
    }
    btn.style.fontSize = `${size}rem`;
    
    if (state.activeTag === tag) {
      btn.style.backgroundColor = "var(--ink)";
      btn.style.color = "var(--surface)";
      btn.style.borderColor = "var(--ink)";
    }
    
    btn.addEventListener("click", () => {
      state.activeTag = tag;
      state.onlyBookmarks = false;
      closeTagModal();
      renderTagbar();
      render();
    });
    
    tagModalCloud.appendChild(btn);
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return "—"; }
}

async function boot() {
  try {
    const res = await fetch("projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    state.all = data.projects || [];
    statCount.textContent = state.all.length;
    statUpdated.textContent = data.generatedAt ? formatDate(data.generatedAt) : "—";
  } catch (err) {
    statCount.textContent = "—";
    statUpdated.textContent = "—";
    console.warn("projects.json not available yet.", err);
  }
  renderTagbar();
  render();
}

search.addEventListener("input", (e) => {
  state.query = e.target.value;
  state.authorFilter = null;
  render();
});

if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    const activeProjects = state.filtered && state.filtered.length ? state.filtered : state.all;
    if (!activeProjects.length) return;

    const randomProject = activeProjects[Math.floor(Math.random() * activeProjects.length)];
    const cardEl = grid.querySelector(`[data-slug="${randomProject.slug}"]`);

    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });

      cardEl.classList.add("card--highlight");
      setTimeout(() => {
        cardEl.classList.remove("card--highlight");
      }, 2000);
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", newTheme === "dark" ? "#0b0c10" : "#f5f1ea");
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    render();
  });
}

function updateActiveNavbarLink(targetHash) {
  const hash = typeof targetHash === "string" ? targetHash : window.location.hash || "#projects";
  const target = pageSections.find((section) => `#${section.id}` === hash) ? hash : "#projects";

  topnavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === target;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncNavbarOnScroll() {
  const offset = window.scrollY + window.innerHeight * 0.25;
  let currentHash = "#projects";

  pageSections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (offset >= sectionTop) {
      currentHash = `#${section.id}`;
    }
  });

  updateActiveNavbarLink(currentHash);
}

window.addEventListener("hashchange", updateActiveNavbarLink);
window.addEventListener("scroll", () => {
  window.requestAnimationFrame(syncNavbarOnScroll);
}, { passive: true });

topnavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setTimeout(updateActiveNavbarLink, 0);
  });
});

updateActiveNavbarLink();

// Dismiss hover card on scroll or click outside
document.addEventListener("scroll", dismissHoverCard, true);
document.addEventListener("click", (e) => {
  if (activeHoverCard && !activeHoverCard.contains(e.target)) {
    dismissHoverCard();
  }
});

boot();

document.addEventListener("mousemove", (e) => {
  glowCursor.style.left = (e.clientX + window.scrollX) + "px";
  glowCursor.style.top = (e.clientY + window.scrollY) + "px";
});

function renderProjects(projects) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  projects.forEach(p => {
    const li = document.createElement("li");
    li.className = "project-card";

    li.innerHTML = `
      <div class="card-top">
        <span class="card-title">${p.title}</span>
        <span class="complexity-badge ${p.complexity}">
          ${capitalize(p.complexity)}
        </span>
      </div>
      <p class="card-desc">${p.description}</p>
    `;

    grid.appendChild(li);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterComplexity(level) {
  document.querySelectorAll(".project-card").forEach(card => {
    const badge = card.querySelector(".complexity-badge");
    card.style.display = (level === "all" || badge.classList.contains(level)) ? "block" : "none";
  });
}

// --- Preview Drawer Logic ---
const previewDrawer = document.getElementById("preview-drawer");
const previewBackdrop = document.querySelector(".preview-drawer__backdrop");
const previewCloseBtn = document.getElementById("preview-close");
const previewTitle = document.getElementById("preview-title");
const previewAuthor = document.getElementById("preview-author");
const previewExternal = document.getElementById("preview-external");
const previewIframeWrapper = document.getElementById("preview-iframe-wrapper");
const previewIframe = document.getElementById("preview-iframe");
const previewSpinner = document.getElementById("preview-spinner");
const switcherBtns = document.querySelectorAll(".preview-switcher-btn");

function openPreviewDrawer(project) {
  if (!previewDrawer) return;

  // Set project details
  previewTitle.textContent = project.title;
  if (project.author) {
    previewAuthor.textContent = "by " + project.author.name;
    previewAuthor.hidden = false;
  } else {
    previewAuthor.hidden = true;
  }
  previewExternal.href = project.entry;

  // Show spinner and load iframe
  previewSpinner.classList.remove("is-hidden");
  previewIframe.src = project.entry;

  // Open the drawer
  previewDrawer.classList.add("is-open");
  previewDrawer.setAttribute("aria-hidden", "false");
}

function closePreviewDrawer() {
  if (!previewDrawer) return;

  previewDrawer.classList.remove("is-open");
  previewDrawer.setAttribute("aria-hidden", "true");
  
  // Unload iframe to save CPU and stop audio
  setTimeout(() => {
    previewIframe.src = "about:blank";
  }, 300); // wait for slide-out animation to finish
}

if (previewDrawer) {
  // Load handler for spinner
  previewIframe.addEventListener("load", () => {
    // Avoid hiding spinner when iframe is blank
    if (previewIframe.src !== "about:blank" && previewIframe.src !== window.location.href) {
      previewSpinner.classList.add("is-hidden");
    }
  });

  // Close handlers
  previewCloseBtn.addEventListener("click", closePreviewDrawer);
  previewBackdrop.addEventListener("click", closePreviewDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && previewDrawer.classList.contains("is-open")) {
      closePreviewDrawer();
    }
  });

  // Device Switcher logic
  switcherBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active button state
      switcherBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Update iframe wrapper class
      const device = btn.dataset.device; // desktop, tablet, mobile
      previewIframeWrapper.className = `preview-drawer__iframe-wrapper device--${device}`;
    });
  });
}
